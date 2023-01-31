export class Expansion {
  public name: string;
  public series: string;
  public tcgName: string = "";
  public releaseDate: String = "";
  public numberOfCards: number = 0;
  public logoURL: string;
  public symbolURL: string;

  constructor(name: string, series: string, logo: string, symbol: string) {
    this.name = name;
    this.series = series;
    this.logoURL = logo;
    this.symbolURL = symbol;
  }

  public getId(): string {
    return this.name.toLowerCase().replace(" ", "-");
  }
}

export class Series {
  public name: string;
  public releaseDate: string;
  public icon: string;

  constructor(name: string, releaseDate: string) {
    this.name = name;
    this.releaseDate = releaseDate;
  }
}

export class Grade {
  public grader: string;
  public grade: number;
  public modifier: string;

  public static gradeRegEx = [
    /(PSA)-(1\.5|10|[1-9])-?(OC|MK|MC|ST|PD|OF)?/g,
    /(CGC)-(10|[1-9]\.?5?)-?(P|E)?/g,
    /(BGS)-(10|[1-9]\.?5?)-?(P)?/g,
    /(ACE)-(10|[1-9])/g,
    /(AGS)-(10|[1-9])/g,
  ];
  /**
   * returns parsed grade or null if invalid
   * @param grade
   * @returns
   */
  public static parseGrade(grade: string): Grade | null {
    let normalGrade = grade.toUpperCase().trim();
    let parsedGrade = null;
    for (let regex of this.gradeRegEx) {
      regex.lastIndex = 0;
      let parts = regex.exec(normalGrade);
      if (parts != null) {
        parsedGrade = new Grade(parts[1], parseInt(parts[2]), parts[3]);
      }
    }
    return parsedGrade;
  }

  constructor(grader: string, grade: number, modifier: string) {
    this.grade = grade;
    this.grader = grader;
    this.modifier = modifier;
  }
}
