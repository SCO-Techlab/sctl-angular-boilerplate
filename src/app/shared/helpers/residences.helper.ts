import { IResidence } from "@shared/interfaces";

export const formatResidenceAddress = (residence: IResidence): string => {
  let address = '';

  if (residence?.street) {
    address += `${residence.street} - `;
  }

  if (residence?.number) {
    address += `${residence.number} - `;
  }

  if (residence?.flat) {
    address += `${residence.flat} - `;
  }

  if (residence?.door) {
    address += `${residence.door} - `;
  }

  if (residence?.city) {
    address += `${residence.city} - `;
  }

  if (residence?.province) {
    address += ` ${residence.province} - `;
  }

  if (residence?.postalCode) {
    address += ` ${residence.postalCode}`;
  }

  return address;
}