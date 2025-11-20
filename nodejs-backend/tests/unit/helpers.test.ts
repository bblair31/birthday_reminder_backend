import {
  calculateAge,
  getDaysUntilBirthday,
  getNextBirthday,
  formatPhoneNumber,
  omitFields,
  pick,
} from '../../src/utils/helpers';

describe('Helper Functions', () => {
  describe('calculateAge', () => {
    it('should calculate age correctly', () => {
      const today = new Date();
      const thirtyYearsAgo = new Date(
        today.getFullYear() - 30,
        today.getMonth(),
        today.getDate()
      );
      expect(calculateAge(thirtyYearsAgo)).toBe(30);
    });

    it('should handle birthday not yet occurred this year', () => {
      const today = new Date();
      const futureThisYear = new Date(
        today.getFullYear() - 30,
        today.getMonth() + 1,
        today.getDate()
      );
      expect(calculateAge(futureThisYear)).toBe(29);
    });
  });

  describe('getDaysUntilBirthday', () => {
    it('should return 0 for today', () => {
      const today = new Date();
      const birthday = new Date(
        today.getFullYear() - 25,
        today.getMonth(),
        today.getDate()
      );
      expect(getDaysUntilBirthday(birthday)).toBe(0);
    });

    it('should return correct days until birthday', () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const birthday = new Date(
        today.getFullYear() - 25,
        tomorrow.getMonth(),
        tomorrow.getDate()
      );
      expect(getDaysUntilBirthday(birthday)).toBe(1);
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format 10-digit number with +1', () => {
      expect(formatPhoneNumber('1234567890')).toBe('+11234567890');
    });

    it('should handle already formatted number', () => {
      expect(formatPhoneNumber('+11234567890')).toBe('+11234567890');
    });

    it('should strip non-digits', () => {
      expect(formatPhoneNumber('(123) 456-7890')).toBe('+11234567890');
    });
  });

  describe('omitFields', () => {
    it('should remove specified fields', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = omitFields(obj, ['b']);
      expect(result).toEqual({ a: 1, c: 3 });
    });
  });

  describe('pick', () => {
    it('should pick specified fields', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = pick(obj, ['a', 'c']);
      expect(result).toEqual({ a: 1, c: 3 });
    });
  });
});
