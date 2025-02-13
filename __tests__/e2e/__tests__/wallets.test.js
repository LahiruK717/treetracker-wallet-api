const faker = require('faker');
const { sendGetRequest, sendPostRequest, responseStatus: {OK}, assert } = require("../config");
const { getSession } = require("../libs/sessionLibrary");
const { testData } = require("../libs/bootstrap.js");

let bearer = null;
const {apiKey} = testData;
const wallet = testData.wallet.name;
const {password} = testData.wallet;
const limit = 50;
const url = `/wallets?limit=${limit}`;

describe("Wallets (Wallet API)", function () {
    before(async () => {
        bearer = await getSession(wallet, password);
    });
    it('Wallets - Returns 200 response status @wallet @regression', async () => {
        const { token } = bearer;
        const headers = {
            'Authorization': `Bearer ${token}`,
            'treetracker-api-key': apiKey,
        };
        const response = await sendGetRequest(url, headers);
        const { status } = response;
        assert.equals(status, OK, 'Response status does not equal!');
    });

    it('Wallets - Verify new managed wallet is created successfully @wallet @regression', async () => {
        const expectedWallet = `NewWalletByAutoTool_${faker.datatype.number()}`;
        let walletCreated = false;
        const { token } = bearer;
        const headers = {
            'Authorization': `Bearer ${token}`,
            'treetracker-api-key': apiKey
        };
        const payload = {
            "wallet": expectedWallet
        };
        const newWalletResponse = await sendPostRequest('/wallets', headers, payload);
        const {status} = newWalletResponse;
        assert.equals(status, OK, 'Response status does not match!');

        const response = await sendGetRequest(url, headers);
        const { wallets } = response.body;
        assert.equals(response.status, OK, 'Response status does not match!');

        for (const wallet of wallets) {
            if (Object.values(wallet).includes(expectedWallet)) {
                walletCreated = true;
                break;
            }
        }

        assert.equals(walletCreated, true, 'Wallet was not created!', response.body);
    })
});