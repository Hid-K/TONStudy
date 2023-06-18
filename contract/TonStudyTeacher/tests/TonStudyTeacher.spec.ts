import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { TonStudyTeacher } from '../wrappers/TonStudyTeacher';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('TonStudyTeacher', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('TonStudyTeacher');
    });

    let blockchain: Blockchain;
    let tonStudyTeacher: SandboxContract<TonStudyTeacher>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        tonStudyTeacher = blockchain.openContract(TonStudyTeacher.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await tonStudyTeacher.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: tonStudyTeacher.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and tonStudyTeacher are ready to use
    });
});
