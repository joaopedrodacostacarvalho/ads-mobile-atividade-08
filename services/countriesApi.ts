import axios from "axios";

const api = axios.create({ baseURL: "https://restcountries.com/v3.1" });

export const getAllCountries = (
  fields: string[] = ["name", "capital", "flags", "cca3", "population"],
) => api.get(`/all?fields=${fields.join(",")}`);

export const getCountryByName = (name: string, fields?: string[]) => {
  const param = fields ? `?fields=${fields.join(",")}` : "";
  return api.get(`/name/${name}${param}`);
};

export const getCountryByCode = (code: string, fields?: string[]) => {
  const param = fields ? `?fields=${fields.join(",")}` : "";
  return api.get(`/alpha/${code}${param}`);
};
