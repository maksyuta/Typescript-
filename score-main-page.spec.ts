import { test, expect } from '../../../fixtures/modules_fixtures/credit_score_fixtures/credit-score-fixture';
import { allure } from 'allure-playwright';
import * as owner from "../../../utils/owners.json"
import { StorybookModulesEnum } from '../../../utils/enums';
import { STORYBOOK_CREDENTIALS} from "../../../../playwright.config";

test.describe('Check work sections in main page @webcomponents', () => {

    const titleScoreHistory = 'Score History';
    const titleAccountOverview = 'Account Overview';
    const titleScoreFactors = 'Score Factors';

    test.beforeEach(async ({ creditScoreParams }) => {
        allure.owner(owner['Serhiy Maksiuta']);
        await creditScoreParams.setSettingsPage(StorybookModulesEnum.creditScore,  STORYBOOK_CREDENTIALS.creditScoreApi,
            STORYBOOK_CREDENTIALS.creditScoreEmail, STORYBOOK_CREDENTIALS.creditScoreId);
    })

    test("Checking Score History section", async ({ creditScoreParams, storybookParams }) => {
        await test.step(`WHEN I'm opened Score History section`, async () => {
            await creditScoreParams.connectScorePageConnectedState.scoreHistoryButton.click();
        })

        await test.step(`THEN I check and saw that accessibility has zero violations`, async () => {
            expect(await storybookParams.storybookPage.checkAccessibility()).toBeTruthy();
        })

        await test.step(`AFTER that I'm checked Score History is open`, async () => {
            await expect(creditScoreParams.connectScorePageConnectedState.headerTitle).toHaveText(titleScoreHistory);
        })

        await test.step(`CHECK displayed graph with history data and tabs"`, async () => {
            await expect(creditScoreParams.connectScorePageConnectedState.scoreHistoryGraph).toBeVisible();
        })

        await test.step(`WHEN I'm click tab "3 month"`, async () => {
            await creditScoreParams.connectScorePageConnectedState.threeMonth.click();
        })

        await test.step(`THEN I'm check enabled tab "3 month"`, async () => {
            await expect(creditScoreParams.connectScorePageConnectedState.threeMonth).toBeEnabled();
        })

        await test.step(`WHEN I'm click tab "6 month"`, async () => {
            await creditScoreParams.connectScorePageConnectedState.sixMonth.click();
        })

        await test.step(`THEN I'm check enabled tab "6 month"`, async () => {
            await expect(creditScoreParams.connectScorePageConnectedState.sixMonth).toBeEnabled();
        })

        await test.step(`WHEN I'm click tab "1 year"`, async () => {
            await creditScoreParams.connectScorePageConnectedState.oneYear.click();
        })

        await test.step(`THEN I'm check enabled tab "1 year"`, async () => {
            await expect(creditScoreParams.connectScorePageConnectedState.threeMonth).toBeEnabled();
        })

        await test.step(`Check displayed description block`, async () => {
            await expect(creditScoreParams.connectScorePageConnectedState.scoreDescription).toBeVisible();
        })

        await test.step(`WHEN I'm click button Back"`, async () => {
            await creditScoreParams.connectScorePageConnectedState.buttonBackInHeader.click();
        })

        await test.step(`THEN I'm check displayed title of main page`, async () => {
            await expect(creditScoreParams.connectScorePage.titleCreditScore).toBeVisible();
        })
    })

    test("Check embeded insights in the Score History page", async ({ creditScoreParams }) => {
        await test.step(`WHEN I'm opened Score History section`, async () => {
            await creditScoreParams.connectScorePageConnectedState.scoreHistoryButton.click();
        })

        await test.step(`CHECK displayed embeded insight`, async () => {
            await expect(creditScoreParams.connectScorePageConnectedState.buttonEmbededInsight).toBeVisible();
        })

        await test.step(`WHEN I'm opened insight`, async () => {
            await creditScoreParams.connectScorePageConnectedState.buttonEmbededInsight.click();
        })

        await test.step(`THEN I'm displayed embeded insight is opened`, async () => {
            await expect(creditScoreParams.connectScorePageConnectedState.insightsHeader).toBeVisible();
        })

        await test.step(`WHEN I'm click cross button`, async () => {
            await creditScoreParams.connectScorePageConnectedState.crossButtonInInsights.click();
        })

        await test.step(`THEN I'm checked displayed Score History page`, async () => {
            await expect(creditScoreParams.connectScorePageConnectedState.headerTitle).toHaveText(titleScoreHistory);
        })
    })

    test("Check embeded insights in the Account Overview page", async ({ creditScoreParams }) => {
        await test.step(`WHEN I'm opened Account Overview section`, async () => {
            await creditScoreParams.connectScorePageConnectedState.accountOverviewButton.click();
        })

        await test.step(`CHECK displayed embeded insight`, async () => {
            await expect(creditScoreParams.connectScorePageConnectedState.buttonEmbededInsight).toBeVisible();
        })

        await test.step(`WHEN I'm opened insight`, async () => {
            await creditScoreParams.connectScorePageConnectedState.buttonEmbededInsight.click();
        })

        await test.step(`THEN I'm displayed embeded insight is opened`, async () => {
            await expect(creditScoreParams.connectScorePageConnectedState.insightsHeader).toBeVisible();
        })

        await test.step(`WHEN I'm click cross button`, async () => {
            await creditScoreParams.connectScorePageConnectedState.crossButtonInInsights.click();
        })

        await test.step(`THEN I'm checked displayed Account Overview page`, async () => {
            await expect(creditScoreParams.connectScorePageConnectedState.headerTitle).toHaveText(titleAccountOverview);
        })
    })

    test("Check embeded insights in the Score Factors page", async ({ creditScoreParams }) => {
        await test.step(`WHEN I'm opened Score Factors section`, async () => {
            await creditScoreParams.connectScorePageConnectedState.scoreFactorsButton.click();
        })

        await test.step(`CHECK displayed embeded insight`, async () => {
            await expect(creditScoreParams.connectScorePageConnectedState.buttonEmbededInsight).toBeVisible();
        })

        await test.step(`WHEN I'm opened insight`, async () => {
            await creditScoreParams.connectScorePageConnectedState.buttonEmbededInsight.click();
        })

        await test.step(`THEN I'm displayed embeded insight is opened`, async () => {
            await expect(creditScoreParams.connectScorePageConnectedState.insightsHeader).toBeVisible();
        })

        await test.step(`WHEN I'm click cross button`, async () => {
            await creditScoreParams.connectScorePageConnectedState.crossButtonInInsights.click();
        })

        await test.step(`THEN I'm checked displayed Account Overview page`, async () => {
            await expect(creditScoreParams.connectScorePageConnectedState.headerTitle).toHaveText(titleScoreFactors);
        })
    })

    test("Checking Account Overview section", async ({ creditScoreParams, storybookParams }) => {
        await test.step(`WHEN I'm opened Score History section`, async () => {
            await creditScoreParams.connectScorePageConnectedState.accountOverviewButton.click();
        })

        await test.step(`THEN I check and saw that accessibility has zero violations`, async () => {
            expect(await storybookParams.storybookPage.checkAccessibility()).toBeTruthy();
        })

        await test.step(`AFTER that I'm checked Account Overview is open`, async () => {
            await expect(creditScoreParams.connectScorePageConnectedState.headerTitle).toHaveText(titleAccountOverview);
        })

        await test.step(`Checked block abot company information`, async () => {
            await expect(creditScoreParams.connectScorePageConnectedState.companyInformationBlock).toBeVisible();
        })

        await test.step(`Checked blocks: Recommended Limit, Current Balance, Amount Overdue`, async () => {
            await expect(creditScoreParams.connectScorePageConnectedState.accountOverviewFactors).toBeVisible();
            const arr = await creditScoreParams.connectScorePageConnectedState.factorsValueArr.all();
            for (let elem of arr) {
                await expect(elem).toBeVisible();
            }
        })

        await test.step(`WHEN I'm click button Back"`, async () => {
            await creditScoreParams.connectScorePageConnectedState.buttonBackInHeader.click();
        })

        await test.step(`THEN I'm check displayed title of main page`, async () => {
            await expect(creditScoreParams.connectScorePage.titleCreditScore).toBeVisible();
        })
    })

    test("Checking Score Factors section", async ({ creditScoreParams, storybookParams }) => {
        await test.step(`WHEN I'm opened Score Factors section`, async () => {
            await creditScoreParams.connectScorePageConnectedState.scoreFactorsButton.click();
        })

        await test.step(`THEN I check and saw that accessibility has zero violations`, async () => {
            expect(await storybookParams.storybookPage.checkAccessibility()).toBeTruthy();
        })

        await test.step(`AFTER that I'm checked Score Factors is open`, async () => {
            await expect(creditScoreParams.connectScorePageConnectedState.headerTitle).toHaveText(titleScoreFactors);
        })

        await test.step(`Checked score factors value`, async () => {
            await expect(creditScoreParams.connectScorePageConnectedState.factorsValueArr.nth(0)).toBeVisible();
            const arr = await creditScoreParams.connectScorePageConnectedState.factorsValueArr.all();
            for (let elem of arr) {
                await expect(elem).toBeVisible();
            }
        })

        await test.step(`Checked score factors name`, async () => {
            await expect(creditScoreParams.connectScorePageConnectedState.factorsNameArr.nth(0)).toBeVisible();;
            const arr = await creditScoreParams.connectScorePageConnectedState.factorsNameArr.all();
            for (let elem of arr) {
                await expect(elem).toBeVisible();
            }
        })

        await test.step(`Checked score factors impact`, async () => {
            await expect(creditScoreParams.connectScorePageConnectedState.factorsImpactArr.nth(0)).toBeVisible();;
            const arr = await creditScoreParams.connectScorePageConnectedState.factorsImpactArr.all();
            for (let elem of arr) {
                await expect(elem).toBeVisible();
            }
        })

        await test.step(`WHEN I'm click button Back"`, async () => {
            await creditScoreParams.connectScorePageConnectedState.buttonBackInHeader.click();
        })

        await test.step(`THEN I'm check displayed title of main page`, async () => {
            await expect(creditScoreParams.connectScorePage.titleCreditScore).toBeVisible();
        })
    })

    test("CHECK Score Dynamics value is displayed", async ({ creditScoreParams }) => {
        await test.step(`CHECK displaying Score Dynamics data`, async () => {
            await expect(creditScoreParams.connectScorePageConnectedState.scoreDynamicsValue).toBeVisible();
        })
    })

    test("CHECK Boost label is displayed", async ({ creditScoreParams }) => {
        await test.step(`CHECK displaying boosting label`, async () => {
            await expect(creditScoreParams.connectScorePageConnectedState.boostingLabel).toBeVisible();
        })
    })

    test("CHECK Credit Score graph is displayed", async ({ creditScoreParams }) => {
        await test.step(`CHECK displaying general block with graph`, async () => {
            await expect(creditScoreParams.connectScorePageConnectedState.creditGraphBlock).toBeVisible();
        })

        await test.step(`CHECK displaying value in graph`, async () => {
            await expect(creditScoreParams.connectScorePageConnectedState.creditGraphValue).toBeVisible();
        })

        await test.step(`CHECK displaying label under the value`, async () => {
            await expect(creditScoreParams.connectScorePageConnectedState.creditGraphLabel).toBeVisible();
        })
    })

    test("CHECK Boost Score button in the page", async ({ creditScoreParams }) => {
        await test.step(`WHEN I'm click on button Boost Score`, async () => {
            await (creditScoreParams.connectScorePageConnectedState.boostScoreButton).click();
        })

        await test.step(`THEN I'm checked opened page with credit bureaus`, async () => {
            await expect(creditScoreParams.connectScorePageConnectedState.chooseBureauTitle).toBeVisible();
        })
    })

    test("CHECK Insight button in the page", async ({ creditScoreParams }) => {
        await test.step(`WHEN I'm click on insight button `, async () => {
            await (creditScoreParams.connectScorePageConnectedState.insightButtonInMainPage).click();
        })

        await test.step(`THEN I'm checked opened page with insights`, async () => {
            await expect(creditScoreParams.connectScorePageConnectedState.insightsHeader).toBeVisible();
        })

        await test.step(`WHEN I'm closed insights list`, async () => {
            await creditScoreParams.connectScorePageConnectedState.crossButtonInInsights.click();
        })

        await test.step(`THEN I'm checked opened main page`, async () => {
            await expect(creditScoreParams.connectScorePage.titleCreditScore).toBeVisible();
        })
    })
})