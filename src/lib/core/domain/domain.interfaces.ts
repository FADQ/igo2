export interface DomainChoicesResponse {
  data: DomainChoicesResponseItem[];
}

export interface DomainChoicesResponseItem {
  code: string;
  descriptionAbregeeFrancais: string;
  descriptionFrancais: string;
  descriptionAbregeeAnglais: string;
  descriptionAnglaiss: string;
  ordreAffichage: number;
}
