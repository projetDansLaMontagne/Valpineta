import { SuiviExcursionModel } from "./SuiviExcursion"

test("can be created", () => {
  const instance = SuiviExcursionModel.create({})

  expect(instance).toBeTruthy()
})
