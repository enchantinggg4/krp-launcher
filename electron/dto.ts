export interface PatchDTO{
  filename: string;
  hash: string;
  action?: '-' | '+' | '.'
}
export interface PatchesDTO{
  files: PatchDTO[]
}
