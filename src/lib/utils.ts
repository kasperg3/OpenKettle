import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatGravity(value: number): string {
  return value.toFixed(3);
}

export function formatABV(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatIBU(value: number): string {
  return Math.round(value).toString();
}

export function formatSRM(value: number): string {
  return value.toFixed(1);
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function kgToLbs(kg: number): number {
  return kg * 2.20462;
}

export function lbsToKg(lbs: number): number {
  return lbs / 2.20462;
}

export function lToGal(l: number): number {
  return l * 0.264172;
}

export function galToL(gal: number): number {
  return gal / 0.264172;
}

export function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32;
}

export function fahrenheitToCelsius(f: number): number {
  return ((f - 32) * 5) / 9;
}

export function ebcToLovibond(ebc: number): number {
  return (ebc / 1.97 + 0.76) / 1.3546;
}

export function lovibondToEBC(lovibond: number): number {
  return (lovibond * 1.3546 - 0.76) * 1.97;
}

export function srmToEBC(srm: number): number {
  return srm * 1.97;
}

export function ebcToSRM(ebc: number): number {
  return ebc / 1.97;
}
