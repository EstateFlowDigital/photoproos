import { describe, it, expect } from "vitest";
import {
  feetToMeters,
  metersToFeet,
  milesToKilometers,
  kilometersToMiles,
  formatDistance,
  sqFeetToSqMeters,
  sqMetersToSqFeet,
  formatArea,
  fahrenheitToCelsius,
  celsiusToFahrenheit,
  formatTemperature,
  formatCurrency,
  formatCurrencyWhole,
  formatDate,
  formatTime,
  formatDateTime,
  createUnitConverter,
} from "./units";

describe("Length Conversions", () => {
  describe("feetToMeters", () => {
    it("converts 0 feet to 0 meters", () => {
      expect(feetToMeters(0)).toBe(0);
    });

    it("converts 1 foot to approximately 0.3048 meters", () => {
      expect(feetToMeters(1)).toBeCloseTo(0.3048, 4);
    });

    it("converts 10 feet to approximately 3.048 meters", () => {
      expect(feetToMeters(10)).toBeCloseTo(3.048, 3);
    });

    it("handles negative values", () => {
      expect(feetToMeters(-5)).toBeCloseTo(-1.524, 3);
    });
  });

  describe("metersToFeet", () => {
    it("converts 0 meters to 0 feet", () => {
      expect(metersToFeet(0)).toBe(0);
    });

    it("converts 1 meter to approximately 3.28 feet", () => {
      expect(metersToFeet(1)).toBeCloseTo(3.28084, 4);
    });

    it("converts 10 meters to approximately 32.8 feet", () => {
      expect(metersToFeet(10)).toBeCloseTo(32.8084, 3);
    });
  });

  describe("milesToKilometers", () => {
    it("converts 0 miles to 0 km", () => {
      expect(milesToKilometers(0)).toBe(0);
    });

    it("converts 1 mile to approximately 1.609 km", () => {
      expect(milesToKilometers(1)).toBeCloseTo(1.60934, 4);
    });

    it("converts 100 miles to approximately 160.9 km", () => {
      expect(milesToKilometers(100)).toBeCloseTo(160.934, 2);
    });
  });

  describe("kilometersToMiles", () => {
    it("converts 0 km to 0 miles", () => {
      expect(kilometersToMiles(0)).toBe(0);
    });

    it("converts 1 km to approximately 0.621 miles", () => {
      expect(kilometersToMiles(1)).toBeCloseTo(0.62137, 4);
    });

    it("converts 100 km to approximately 62.1 miles", () => {
      expect(kilometersToMiles(100)).toBeCloseTo(62.137, 2);
    });
  });

  describe("formatDistance", () => {
    it("formats miles to imperial", () => {
      expect(formatDistance(10, "miles", "imperial")).toBe("10.0 mi");
    });

    it("formats km to imperial (converts to miles)", () => {
      expect(formatDistance(16.0934, "km", "imperial")).toBe("10.0 mi");
    });

    it("formats km to metric", () => {
      expect(formatDistance(10, "km", "metric")).toBe("10.0 km");
    });

    it("formats miles to metric (converts to km)", () => {
      expect(formatDistance(10, "miles", "metric")).toBe("16.1 km");
    });
  });
});

describe("Area Conversions", () => {
  describe("sqFeetToSqMeters", () => {
    it("converts 0 sq ft to 0 sq m", () => {
      expect(sqFeetToSqMeters(0)).toBe(0);
    });

    it("converts 100 sq ft to approximately 9.29 sq m", () => {
      expect(sqFeetToSqMeters(100)).toBeCloseTo(9.2903, 3);
    });

    it("converts 1000 sq ft to approximately 92.9 sq m", () => {
      expect(sqFeetToSqMeters(1000)).toBeCloseTo(92.903, 2);
    });
  });

  describe("sqMetersToSqFeet", () => {
    it("converts 0 sq m to 0 sq ft", () => {
      expect(sqMetersToSqFeet(0)).toBe(0);
    });

    it("converts 10 sq m to approximately 107.6 sq ft", () => {
      expect(sqMetersToSqFeet(10)).toBeCloseTo(107.639, 2);
    });

    it("converts 100 sq m to approximately 1076 sq ft", () => {
      expect(sqMetersToSqFeet(100)).toBeCloseTo(1076.39, 1);
    });
  });

  describe("formatArea", () => {
    it("formats sq ft to imperial", () => {
      expect(formatArea(1500, "sqft", "imperial")).toBe("1,500 sq ft");
    });

    it("formats sq m to imperial (converts to sq ft)", () => {
      expect(formatArea(100, "sqm", "imperial")).toBe("1,076 sq ft");
    });

    it("formats sq m to metric", () => {
      expect(formatArea(100, "sqm", "metric")).toBe("100 m²");
    });

    it("formats sq ft to metric (converts to sq m)", () => {
      expect(formatArea(1000, "sqft", "metric")).toBe("93 m²");
    });
  });
});

describe("Temperature Conversions", () => {
  describe("fahrenheitToCelsius", () => {
    it("converts 32°F to 0°C", () => {
      expect(fahrenheitToCelsius(32)).toBe(0);
    });

    it("converts 212°F to 100°C", () => {
      expect(fahrenheitToCelsius(212)).toBe(100);
    });

    it("converts 68°F to 20°C", () => {
      expect(fahrenheitToCelsius(68)).toBe(20);
    });

    it("converts -40°F to -40°C", () => {
      expect(fahrenheitToCelsius(-40)).toBe(-40);
    });
  });

  describe("celsiusToFahrenheit", () => {
    it("converts 0°C to 32°F", () => {
      expect(celsiusToFahrenheit(0)).toBe(32);
    });

    it("converts 100°C to 212°F", () => {
      expect(celsiusToFahrenheit(100)).toBe(212);
    });

    it("converts 20°C to 68°F", () => {
      expect(celsiusToFahrenheit(20)).toBe(68);
    });

    it("converts -40°C to -40°F", () => {
      expect(celsiusToFahrenheit(-40)).toBe(-40);
    });
  });

  describe("formatTemperature", () => {
    it("formats F to imperial", () => {
      expect(formatTemperature(68, "F", "imperial")).toBe("68°F");
    });

    it("formats C to imperial (converts to F)", () => {
      expect(formatTemperature(20, "C", "imperial")).toBe("68°F");
    });

    it("formats C to metric", () => {
      expect(formatTemperature(20, "C", "metric")).toBe("20°C");
    });

    it("formats F to metric (converts to C)", () => {
      expect(formatTemperature(68, "F", "metric")).toBe("20°C");
    });
  });
});

describe("Currency Formatting", () => {
  describe("formatCurrency", () => {
    it("formats USD with cents", () => {
      expect(formatCurrency(1234, "USD")).toBe("$12.34");
    });

    it("formats USD with no cents", () => {
      expect(formatCurrency(1200, "USD")).toBe("$12.00");
    });

    it("formats large USD amounts with thousands separator", () => {
      expect(formatCurrency(123456, "USD")).toBe("$1,234.56");
    });

    it("formats EUR with locale-appropriate formatting", () => {
      const result = formatCurrency(1234, "EUR");
      // EUR uses comma as decimal separator in German locale
      expect(result).toContain("12");
      expect(result).toContain("34");
    });

    it("formats GBP correctly", () => {
      expect(formatCurrency(1234, "GBP")).toBe("£12.34");
    });

    it("formats JPY without decimals by default", () => {
      const result = formatCurrency(12345, "JPY");
      // JPY divides by 100 internally but shouldn't show decimals
      expect(result).toContain("123");
    });

    it("respects showDecimals option", () => {
      expect(formatCurrency(1234, "USD", { showDecimals: false })).toBe("$12");
    });

    it("defaults to USD if no currency specified", () => {
      expect(formatCurrency(1000)).toBe("$10.00");
    });
  });

  describe("formatCurrencyWhole", () => {
    it("formats without decimal places", () => {
      expect(formatCurrencyWhole(1234, "USD")).toBe("$12");
    });

    it("rounds to nearest whole number", () => {
      expect(formatCurrencyWhole(1299, "USD")).toBe("$13");
    });

    it("defaults to USD", () => {
      expect(formatCurrencyWhole(5000)).toBe("$50");
    });
  });
});

describe("Date/Time Formatting", () => {
  const testDate = new Date("2024-06-15T14:30:00");

  describe("formatDate", () => {
    it("formats date with default options", () => {
      const result = formatDate(testDate);
      expect(result).toContain("Jun");
      expect(result).toContain("15");
      expect(result).toContain("2024");
    });

    it("accepts string date input", () => {
      const result = formatDate("2024-06-15T14:30:00");
      expect(result).toContain("Jun");
      expect(result).toContain("15");
    });

    it("uses specified locale", () => {
      const result = formatDate(testDate, "de-DE");
      expect(result).toContain("15");
      expect(result).toContain("2024");
    });
  });

  describe("formatTime", () => {
    it("formats time in 12-hour format by default", () => {
      const result = formatTime(testDate, "en-US", false);
      expect(result).toContain("2:30");
      expect(result).toMatch(/PM/i);
    });

    it("formats time in 24-hour format when specified", () => {
      const result = formatTime(testDate, "en-US", true);
      expect(result).toContain("14:30");
    });

    it("accepts string date input", () => {
      const result = formatTime("2024-06-15T14:30:00");
      expect(result).toContain("2:30");
    });
  });

  describe("formatDateTime", () => {
    it("formats both date and time", () => {
      const result = formatDateTime(testDate);
      expect(result).toContain("Jun");
      expect(result).toContain("15");
      expect(result).toContain("2:30");
    });

    it("respects 24-hour format option", () => {
      const result = formatDateTime(testDate, "en-US", true);
      expect(result).toContain("14:30");
    });
  });
});

describe("createUnitConverter", () => {
  it("creates a converter with imperial settings", () => {
    const converter = createUnitConverter({ system: "imperial" });

    expect(converter.distance(10, "miles")).toBe("10.0 mi");
    expect(converter.area(1000, "sqft")).toBe("1,000 sq ft");
    expect(converter.temperature(68, "F")).toBe("68°F");
  });

  it("creates a converter with metric settings", () => {
    const converter = createUnitConverter({ system: "metric" });

    expect(converter.distance(10, "km")).toBe("10.0 km");
    expect(converter.area(100, "sqm")).toBe("100 m²");
    expect(converter.temperature(20, "C")).toBe("20°C");
  });

  it("uses custom currency", () => {
    const converter = createUnitConverter({
      system: "imperial",
      currency: "GBP",
    });

    expect(converter.currency(1234)).toBe("£12.34");
  });

  it("formats dates and times", () => {
    const converter = createUnitConverter({
      system: "imperial",
      locale: "en-US",
    });

    const testDate = new Date("2024-06-15T14:30:00");
    expect(converter.date(testDate)).toContain("Jun");
    expect(converter.time(testDate)).toContain("2:30");
    expect(converter.dateTime(testDate)).toContain("Jun");
  });
});
