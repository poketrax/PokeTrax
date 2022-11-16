use std::path::PathBuf;
use std::sync::{Mutex};
use lazy_static::lazy_static;
use actix_web::{web, Responder, Result, error, get};
use jsonwebtoken::jwk::AlgorithmParameters;
use jsonwebtoken::{decode, encode ,decode_header, jwk, DecodingKey, Validation, Header, EncodingKey, Algorithm};
use serde::{Serialize, Deserialize};
use reqwest;
use std::{fs::File};
use serde_json::Value;
use std::collections::HashMap;
use std::time::{SystemTime};
use webbrowser;

static GOOGLE_KEYS_URL: &str = "https://www.googleapis.com/oauth2/v3/certs";
static GCP_TOKEN_URL: &str = "https://oauth2.googleapis.com/token";
static CLIENT_ID: &str = "410496031249-053d7jdhlpjdu3aedhandv1ap887pbij.apps.googleusercontent.com";
static CLIENT_SECRET: &str = "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";
static REDIRECT_URI: &str = "http://localhost:3131/gcp/auth/callback"; 

static LOGIN_URL: &str = "https://accounts.google.com/o/oauth2/v2/auth";
static LOGIN_CLIENT_ID: &str = "?client_id=410496031249-053d7jdhlpjdu3aedhandv1ap887pbij.apps.googleusercontent.com";
static LOGIN_SCOPE: &str = "&scope=openid%20https://www.googleapis.com/auth/firebase.database%20https://www.googleapis.com/auth/cloud-platform";
static SERVICE_SCOPE: &str = "openid email https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/cloud-platform";
static LOGIN_R_CODE: &str = "&response_type=code";
static LOGIN_REDIR_URI: &str = "&redirect_uri=http%3A%2F%2Flocalhost%3A3131%2Fgcp%2Fauth%2Fcallback";
static LOGIN_ACCESS_TYPE: &str = "&access_type=offline";
static LOGIN_PROMPT: &str = "&prompt=consent";

#[derive(Deserialize, Serialize)]
pub struct CallbackQuery {
    code: String,
    scope: String,
    prompt: String
}
#[derive(Deserialize, Serialize)]
struct Oauth {
    access_token: String,
    id_token: String,
    refresh_token: String,
    exp: u64
}
#[derive(Deserialize, Serialize)]
struct Claims {
    iss: String,
    scope: Option<String>,
    aud: String,
    iat: u64,
    exp: u64
}
#[derive(Deserialize, Serialize)]
struct GoogleKey {
    #[serde(rename="type")]
    _type: String,
    project_id: String,
    private_key_id: String,
    private_key: String,
    client_email: String,
    client_id: String,
    auth_uri: String,
    token_uri: String,
    auth_provider_x509_cert_url: String,
    client_x509_cert_url: String
}
lazy_static! {
    static ref OIDC: Mutex<Oauth> = Mutex::new(
        Oauth{
            access_token: String::new(),
            id_token: String::new(),
            refresh_token: String::new(),
            exp: 0
        }
    );
}

#[get("/gcp/auth/login")]
pub async fn login() -> Result<impl Responder>{
    let url = format!("{}{}{}{}{}{}{}",
        LOGIN_URL,
        LOGIN_CLIENT_ID,
        LOGIN_SCOPE,
        LOGIN_R_CODE,
        LOGIN_REDIR_URI,
        LOGIN_ACCESS_TYPE,
        LOGIN_PROMPT);
    if webbrowser::open(url.as_str()).is_ok() {
        Ok("launched")
    }else{
        Err(error::ErrorInternalServerError("failed to launch"))
    }
}

#[get("/gcp/auth/exp")]
pub async fn expire() -> Result<impl Responder>{
    let oidc = OIDC.lock().unwrap();
    let claims = Claims{
        iss: String::new(),
        scope: Some(String::new()),
        aud: String::new(),
        iat: 0,
        exp: oidc.exp
    };
    Ok(web::Json(claims))
}

#[get("/gcp/auth/access_token")]
pub async fn jwt_token() -> Result<impl Responder>{
    let oidc = OIDC.lock().unwrap();
    let response = format!("Bearer {}", oidc.access_token);
    Ok(response)
}

#[get("/gcp/auth/callback")]
pub async fn auth_callback(path: web::Query<CallbackQuery>) -> Result<impl Responder>{
    //auth code request
    let mut form = HashMap::new();
    form.insert("code", path.code.clone());
    form.insert("grant_type", String::from("authorization_code"));
    form.insert("client_id", String::from(CLIENT_ID));
    form.insert("client_secret", String::from(CLIENT_SECRET));
    form.insert("redirect_uri", String::from(REDIRECT_URI));
    let client = reqwest::Client::new();
    let res = client.post(GCP_TOKEN_URL)
        .header("Content-Type", "application/x-www-form-urlencoded")
        .form(&form)
        .send()
        .await.unwrap();
    let oidc_resp: Value = res.json().await.unwrap();
    let idt = oidc_resp["id_token"].as_str().unwrap();
    let access = oidc_resp["access_token"].as_str().unwrap();
    let refresh = oidc_resp["refresh_token"].as_str().unwrap();
    let exp = get_exp_date(idt).await.unwrap();
    let mut oidc = OIDC.lock().unwrap();
    oidc.access_token = String::from(access);
    oidc.refresh_token = String::from(refresh);
    oidc.id_token = String::from(idt);
    oidc.exp = exp;
    Ok("Logged In, You can close this window")
}

async fn get_exp_date(token: &str) -> Result<u64, Box<dyn std::error::Error>>{
    let jkws_response: String = reqwest::get(GOOGLE_KEYS_URL).await.unwrap().text().await.unwrap();
    let jwks: jwk::JwkSet = serde_json::from_str(jkws_response.as_str()).unwrap();
    let header = decode_header(token).unwrap();
    let kid = match header.kid {
        Some(k) => k,
        None => return Err("Token doesn't have a `kid` header field".into()),
    };
    if let Some(j) = jwks.find(&kid) {
        match j.algorithm {
            AlgorithmParameters::RSA(ref rsa) => {
                let decoding_key = DecodingKey::from_rsa_components(&rsa.n, &rsa.e).unwrap();
                let mut validation = Validation::new(j.common.algorithm.unwrap());
                validation.validate_exp = false;
                let decoded_token;
                match decode::<Claims>(token, &decoding_key, &validation){
                    Ok(val) => decoded_token = val,
                    Err(e) => return Err(Box::from(e))
                }
                return Ok(decoded_token.claims.exp);
            }
            _ => unreachable!("This should be a RSA"),
        }
    } else {
        return Err("No matching JWK found for the given kid".into());
    }
}

pub fn get_access_token() -> String{
    let oidc = OIDC.lock().unwrap();
    let access_token = oidc.access_token.clone();
    return access_token;
}

pub async fn service_login(path: PathBuf) -> Result<(), Box<dyn std::error::Error>>{
    let time = SystemTime::now().duration_since(SystemTime::UNIX_EPOCH).unwrap().as_secs();
    let file = File::open(path).unwrap();
    let mut json_reader = serde_json::Deserializer::from_reader(file);
    let gcp_key = GoogleKey::deserialize(&mut json_reader).unwrap();
    let claims = Claims{
        iss: gcp_key.client_email.clone(),
        scope: Some(String::from(SERVICE_SCOPE)),
        aud: String::from(GCP_TOKEN_URL),
        iat: time,
        exp: time + 60
    };
    let raw_key = gcp_key.private_key.as_str().as_bytes();
    let private_key = EncodingKey::from_rsa_pem(raw_key).unwrap(); 
    let token = encode(&Header::new(Algorithm::RS256), &claims, &private_key).unwrap();
    let client = reqwest::Client::new();
    let mut params = HashMap::new();
    params.insert(String::from("grant_type"), String::from("urn:ietf:params:oauth:grant-type:jwt-bearer"));
    params.insert(String::from("assertion"), token);
    let result: Value = client.post(gcp_key.token_uri)
        .form(&params)
        .send().await.unwrap()
        .json().await.unwrap();
    let mut oidc = OIDC.lock().unwrap();
    let access_token = String::from(result["access_token"].as_str().unwrap());
    oidc.access_token = String::from(access_token);
    oidc.exp = SystemTime::now().duration_since(SystemTime::UNIX_EPOCH).unwrap().as_secs() + 3600;
    Ok(())
}