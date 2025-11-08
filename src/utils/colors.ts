const lightTheme = {
  colors: {
    // Sun-themed - Light
    primary: "rgb(255, 167, 38)",         // warm orange (#FFA726)
    onPrimary: "rgb(0, 0, 0)",            // dark text on primary
    primaryContainer: "rgb(255, 224, 178)",
    onPrimaryContainer: "rgb(51, 35, 0)",

    secondary: "rgb(255, 193, 7)",        // amber accent (#FFC107)
    onSecondary: "rgb(0, 0, 0)",
    secondaryContainer: "rgb(255, 236, 179)",
    onSecondaryContainer: "rgb(51, 35, 0)",

    tertiary: "rgb(255, 238, 88)",
    onTertiary: "rgb(0, 0, 0)",
    tertiaryContainer: "rgb(255, 249, 196)",
    onTertiaryContainer: "rgb(51, 35, 0)",

    error: "rgb(186, 26, 26)",
    onError: "rgb(255, 255, 255)",
    errorContainer: "rgb(255, 218, 214)",
    onErrorContainer: "rgb(65, 0, 2)",

    background: "rgb(255, 250, 240)",     // soft cream
    onBackground: "rgb(30, 30, 30)",
    surface: "rgb(255, 255, 252)",
    onSurface: "rgb(30, 30, 30)",

    surfaceVariant: "rgb(255, 244, 229)",
    onSurfaceVariant: "rgb(92, 67, 42)",
    outline: "rgb(137, 109, 77)",
    outlineVariant: "rgb(191, 176, 156)",

    shadow: "rgb(0, 0, 0)",
    scrim: "rgb(0, 0, 0)",
    inverseSurface: "rgb(46, 49, 50)",
    inverseOnSurface: "rgb(239, 241, 241)",
    inversePrimary: "rgb(255, 204, 128)",

    elevation: {
      level0: "transparent",
      level1: "rgb(255, 249, 240)",
      level2: "rgb(255, 245, 230)",
      level3: "rgb(255, 240, 220)",
      level4: "rgb(255, 235, 210)",
      level5: "rgb(255, 230, 200)",
    },

    surfaceDisabled: "rgba(30, 30, 30, 0.12)",
    onSurfaceDisabled: "rgba(30, 30, 30, 0.38)",
    backdrop: "rgba(41, 50, 52, 0.4)",
  },
};

const darkTheme = {
  colors: {
    // Sun-themed - Dark
    primary: "rgb(255, 204, 128)",       // softer amber on dark
    onPrimary: "rgb(33, 33, 33)",
    primaryContainer: "rgb(102, 60, 0)",
    onPrimaryContainer: "rgb(255, 245, 220)",

    secondary: "rgb(255, 213, 79)",
    onSecondary: "rgb(30, 20, 0)",
    secondaryContainer: "rgb(125, 80, 0)",
    onSecondaryContainer: "rgb(255, 245, 220)",

    tertiary: "rgb(255, 230, 120)",
    onTertiary: "rgb(30, 20, 0)",
    tertiaryContainer: "rgb(95, 65, 0)",
    onTertiaryContainer: "rgb(255, 245, 220)",

    error: "rgb(255, 180, 171)",
    onError: "rgb(105, 0, 5)",
    errorContainer: "rgb(147, 0, 10)",
    onErrorContainer: "rgb(255, 180, 171)",

    background: "rgb(26, 18, 0)",       // deep warm dark
    onBackground: "rgb(255, 245, 230)",
    surface: "rgb(30, 22, 2)",
    onSurface: "rgb(255, 245, 230)",

    surfaceVariant: "rgb(70, 50, 28)",
    onSurfaceVariant: "rgb(255, 238, 210)",
    outline: "rgb(160, 125, 85)",
    outlineVariant: "rgb(90, 70, 50)",

    shadow: "rgb(0, 0, 0)",
    scrim: "rgb(0, 0, 0)",
    inverseSurface: "rgb(255, 245, 230)",
    inverseOnSurface: "rgb(30, 30, 30)",
    inversePrimary: "rgb(255, 167, 38)",

    elevation: {
      level0: "transparent",
      level1: "rgb(30, 22, 4)",
      level2: "rgb(34, 24, 6)",
      level3: "rgb(38, 28, 8)",
      level4: "rgb(42, 32, 10)",
      level5: "rgb(46, 36, 12)",
    },

    surfaceDisabled: "rgba(255, 245, 230, 0.12)",
    onSurfaceDisabled: "rgba(255, 245, 230, 0.38)",
    backdrop: "rgba(41, 50, 52, 0.4)",
  },
};

// Export as an object containing both themes
export const colorPalette = {
  light: lightTheme,
  dark: darkTheme,
};

// Alias to avoid breakage from a common misspelling seen in the codebase
export const colorPallet = colorPalette;

// Alternative: Export as separate named exports
// export { lightTheme, darkTheme };