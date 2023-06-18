import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { TonStudyGrade, TonStudyGradeConfig } from '../wrappers/TonStudyGrade';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('TonStudyGrade', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('TonStudyGrade');
    });

    let blockchain: Blockchain;
    let tonStudyGrade: SandboxContract<TonStudyGrade>;
    let tonStudyGradeConfig: TonStudyGradeConfig

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        tonStudyGradeConfig = {
            value : 3,
            maxValue : 5,
            comment : "Test grade!",
            teacher : (await blockchain.treasury('deployer')).getSender().address,
            student : (await blockchain.treasury('deployer')).getSender().address,
            studyOrganisation : (await blockchain.treasury('deployer')).getSender().address,
            creationTimestamp: Date.now()
        }

        tonStudyGrade = blockchain.openContract(TonStudyGrade.createFromConfig(
            tonStudyGradeConfig,
            code
        ));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await tonStudyGrade.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: tonStudyGrade.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and tonStudyGrade are ready to use
    });

    it('should get royalty', async () => {
        const value = await tonStudyGrade.getRoyalty();

        expect( value.comment ).toEqual( tonStudyGradeConfig.comment );
        expect( value.maxValue ).toEqual( tonStudyGradeConfig.maxValue );
        expect( value.value ).toEqual( tonStudyGradeConfig.value );
        expect( value.teacher.hash ).toEqual( tonStudyGradeConfig.teacher.hash );
        expect( value.student.hash ).toEqual( tonStudyGradeConfig.student.hash );
        expect( value.studyOrganisation.hash ).toEqual( tonStudyGradeConfig.studyOrganisation.hash );
    });

    it('should get status', async () => {
        const value = await tonStudyGrade.getStatus();
        
        expect(value).toEqual( 0x01 );
    });

    it('should remove grade', async () => {
        const statusBeforeRemove = await tonStudyGrade.getStatus();
        expect(statusBeforeRemove).toEqual( 0x01 );

        const removeResult = await tonStudyGrade.sendRemove(
            ( await blockchain.treasury('deployer') ).getSender(),
            toNano('0.05')
        );

        expect(removeResult.transactions).toHaveTransaction({
            from: ( await blockchain.treasury('deployer') ).getSender().address,
            to: tonStudyGrade.address,
            success: true,
            exitCode: 1
        });

        const statusAfterRemove = await tonStudyGrade.getStatus();
        expect(statusAfterRemove).toEqual( 0x02 );
    });

    // it('should replace grade', async () => {
    //     const statusBeforeRemove = await tonStudyGrade.getStatus();
    //     expect(statusBeforeRemove).toEqual( 0x01 );

    //     const removeResult = await tonStudyGrade.sendReplace(
    //         ( await blockchain.treasury('deployer') ).getSender(),
    //         toNano('0.05'),
    //         4,
    //         "Replacement grade comment"
    //     );

    //     expect(removeResult.transactions).toHaveTransaction({
    //         from: ( await blockchain.treasury('deployer') ).getSender().address,
    //         to: tonStudyGrade.address,
    //         success: true,
    //         exitCode: 1
    //     });

    //     const replacementGradeGotFromOldGrade = await tonStudyGrade.getReplacementGrade()

    //     const replacementGrade = await blockchain.getContract( replacementGradeGotFromOldGrade )

    //     expect(replacementGrade).toBeDefined();

    //     const statusAfterRemove = await tonStudyGrade.getStatus();
    //     expect(statusAfterRemove).toEqual( 0x03 );
    // });
});
