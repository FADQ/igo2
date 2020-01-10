import { FormFieldSelectChoice } from '@igo2/common';

export const ClientParcelColors: [number, number, number][] = [
  [142, 36, 170], // Purple
  [233, 29, 40],  // Pink-red
  [255, 143, 0],  // Orange,
  [255, 235, 59],  // Yellow
  [177, 238, 70] // Lime-green
];

export const ClientRelationColors: {[key: string]: [number, number, number]} = {
  '1': [255, 139, 0], // Orange
  '2': [35, 140, 0],  // Green
  '3': [0, 218, 250]  //Teal
};

export const ClientParcelDraineeChoices: FormFieldSelectChoice[] = [
  {value: null, title: ''},
  {value: 'O', title: 'Oui'},
  {value: 'N', title: 'Non'}
];
