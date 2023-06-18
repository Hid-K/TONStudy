import { toNano } from 'ton-core';
import { TonStudyTeacher } from '../wrappers/TonStudyTeacher';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const tonStudyTeacher = provider.open(TonStudyTeacher.createFromConfig({}, await compile('TonStudyTeacher')));

    await tonStudyTeacher.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(tonStudyTeacher.address);

    // run methods on `tonStudyTeacher`
}
