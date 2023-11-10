/**
 * @file src/test/gpx.test.ts
 * @description gpx.test
 * @author Tom Planche
 */

// IMPORTS ===================================================================================================  IMPORTS
import fs from 'fs';
// END IMPORTS ==========================================================================================   END IMPORTS

// VARIABLES ================================================================================================ VARIABLE
// Type(s)

// Other(s)
const gpxFile = '/Users/tom_planche/Desktop/BUT/BUT3/SAE_Valpineta/Valpineta/src/assets/gpx/Balcon2-1.gpx';
// END VARIABLES ======================================================================================= END VARIABLES

// CODE ========================================================================================================= CODE
const gpx = fs.readFileSync(gpxFile, 'utf8');

describe('gpx', () => {
  test('gpx', () => {
    console.log(gpx);
    expect(gpx).toBe(gpx);
  });
});
// END CODE =======================================================================================  END COMPONENT

/**
 * End of file src/test/gpx.test.ts
 */
