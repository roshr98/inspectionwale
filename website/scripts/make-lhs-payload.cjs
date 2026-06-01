const fs = require('node:fs');

function main() {
  const base = JSON.parse(fs.readFileSync('test-data/placeholders-test.json', 'utf8'));

  base.__debugPdf = false;
  base.lhs = {
    ...base.lhs,
    fender_condition: 'LHS_FENDER_CONDITION__TEST',
    fender_repainted: 'LHS_FENDER_REPAINTED__TEST_NO',
    fender_paint_depth: 'LHS_FENDER_PAINT_DEPTH__TEST_111',
    front_door_condition: 'LHS_FRONT_DOOR_CONDITION__TEST',
    front_door_repainted: 'LHS_FRONT_DOOR_REPAINTED__TEST_NO',
    front_door_paint_depth: 'LHS_FRONT_DOOR_PAINT_DEPTH__TEST_121',
    front_door_company_fitted: 'LHS_FRONT_DOOR_COMPANY_FITTED__TEST_YES',
    rear_door_condition: 'LHS_REAR_DOOR_CONDITION__TEST',
    rear_door_repainted: 'LHS_REAR_DOOR_REPAINTED__TEST_NO',
    rear_door_paint_depth: 'LHS_REAR_DOOR_PAINT_DEPTH__TEST_118',
    rear_door_company_fitted: 'LHS_REAR_DOOR_COMPANY_FITTED__TEST_YES',
    quarter_panel_condition: 'LHS_QUARTER_PANEL_CONDITION__TEST',
    quarter_panel_repainted: 'LHS_QUARTER_PANEL_REPAINTED__TEST_NO',
    quarter_panel_paint_depth: 'LHS_QUARTER_PANEL_PAINT_DEPTH__TEST_117',
    window_glass_original: 'LHS_WINDOW_GLASS_ORIGINAL__TEST_YES',
    side_mirror_condition: 'LHS_SIDE_MIRROR_CONDITION__TEST',
  };

  fs.mkdirSync('test-output', { recursive: true });
  fs.writeFileSync('test-output/lhs-payload.json', JSON.stringify(base, null, 2));
  console.log('Wrote test-output/lhs-payload.json');
}

main();
