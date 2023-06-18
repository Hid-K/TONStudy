import { toNano } from 'ton-core';
import { TonStudyGrade } from '../wrappers/TonStudyGrade';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const tonStudyGrade = provider.open(TonStudyGrade.createFromConfig({}, await compile('TonStudyGrade')));

    await tonStudyGrade.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(tonStudyGrade.address);

    // run methods on `tonStudyGrade`
}
