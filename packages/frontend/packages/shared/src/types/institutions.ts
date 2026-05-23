export interface IInstitution {
  _id?: string;
  name: string;
  code: string; // alphanumeric lookup code
  domain: string;
  address?: string;
  createdAt: Date;
}
