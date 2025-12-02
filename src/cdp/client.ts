const ChromeLauncher = require('chrome-launcher');
import CDP from 'chrome-remote-interface';
import { T_Client, T_Page, T_DOM, T_DOMSnapshot, T_Runtime } from '../third-party/types';

type CDPConnection = {
    client: T_Client;
    Page: T_Page;
    DOM: T_DOM;
    DOMSnapshot: T_DOMSnapshot;
    Runtime: T_Runtime;
};

export async function connectCDP(): Promise<CDPConnection> {
    const chrome = await ChromeLauncher.launch();
    const client = await CDP({
        host: '127.0.0.1',
        port: chrome.port,
    });

    const { Page, Network, DOM, DOMSnapshot, Runtime } = client;

    Network.requestWillBeSent((params) => {
        console.log(`[Request]: ${params.request.url}`);
    });

    await Network.enable();
    await Page.enable();
    await DOM.enable({});
    await DOMSnapshot.enable();
    await Runtime.enable();

    await Page.navigate({ url: 'https://subhash3.github.io/' });
    await Page.loadEventFired();

    return { client, Page, DOM, DOMSnapshot, Runtime };
}
