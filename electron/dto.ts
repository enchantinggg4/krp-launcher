export interface PatchDTO{
  filename: string;
  hash: string;
}
export interface PatchesDTO{
  files: PatchDTO[]
}
