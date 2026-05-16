import axios from 'axios';

const api = axios.create({
  baseURL: 'https://restcountries.com/v3.1',
});

export const getAllCountries = (fields: string[] = ['name', 'capital', 'flags', 'cca3']) => {
  const fieldsParam = fields.join(',');
  return api.get(`/all?fields=${fieldsParam}`);
};

export const getCountryByName = (name: string, fields?: string[]) => {
  const fieldsParam = fields ? `?fields=${fields.join(',')}` : '';
  return api.get(`/name/${name}${fieldsParam}`);
};

export const getCountryByCode = (code: string, fields?: string[]) => {
  const fieldsParam = fields ? `?fields=${fields.join(',')}` : '';
  return api.get(`/alpha/${code}${fieldsParam}`);
};