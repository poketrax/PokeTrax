const package = require('../package.json')
const os = process.argv[2]
switch(os){
    case 'ubuntu-latest':
        console.log(`poketrax_${package.version}_amd64.snap`)
        break;
    case 'windows-latest':
        console.log(`PokeTrax.Setup.${package.version}.exe`)
        break;
    case 'macos-latest':
        console.log(`PokeTrax-${package.version}.dmg`)
        break;
    default:
        console.log()
}