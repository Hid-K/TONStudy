import { address, Address, beginCell, Cell, comment, Contract, contractAddress, ContractProvider, Sender, SendMode, Slice } from 'ton-core';

export type TonStudyGradeConfig = {
    value: number,
    maxValue: number,
    comment: string,
    teacher: Address,
    student: Address,
    studyOrganisation: Address,
    creationTimestamp: number
};

export function tonStudyGradeConfigToCell(
    config: TonStudyGradeConfig
): Cell
{
    if( config.value > config.maxValue )
        throw new Error( "Grade value must not be higher than it's maximum value" );

    if( config.value < 0 )
        throw new Error( "Grade value cannot be below zero" );

    if( config.maxValue <= 0 )
        throw new Error( "Grade max value cannot be equal or below zero" );

    if( config.comment.length > 127 )
        throw new Error( "Grade comment cannot be longer than 127 characters" );

    return beginCell()
    .storeUint( 0x01, 8 ) // Set grade status "normal"
    .storeAddress(null) // Set grade replacement grade address as null because it is no replacement grade for new grade
    .storeRef( // Set royalty
        beginCell()
            .storeUint( config.value, 8 ) // Grade value
            .storeUint( config.maxValue, 8 ) // Grade value
            .storeAddress( config.teacher ) // Teacher who deployed this grade's contract
            .storeAddress( config.student ) 
            .storeAddress( config.studyOrganisation )
            .storeUint( config.creationTimestamp, 64 ) // Grade creation timestamt
            .storeSlice(
                beginCell()
                    .storeStringTail( config.comment ) // Grade comment
                .asSlice()
            )
        .endCell()
    )
    .endCell();
}

export class TonStudyGrade implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new TonStudyGrade(address);
    }

    static createFromConfig( config: TonStudyGradeConfig, code: Cell, workchain = 0 ) {
        const data = tonStudyGradeConfigToCell( config );
        const init = { code, data };
        return new TonStudyGrade(contractAddress(workchain, init), init);
    }

    async sendDeploy( provider: ContractProvider, via: Sender, value: bigint ) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async getRoyalty( provider: ContractProvider )
    {
        const { stack } = await provider.get( "royalty_params", [] );

        const cellParser = stack.readCell().beginParse()

        return {
            "value" : cellParser.loadUint(8),
            "maxValue" : cellParser.loadUint(8),
            "teacher" : cellParser.loadAddress(),
            "student" : cellParser.loadAddress(),
            "studyOrganisation" : cellParser.loadAddress(),
            "creationTimestamp" : cellParser.loadUint(64),
            "comment" : cellParser.loadStringTail()
        }
    }

    async getStatus( provider: ContractProvider )
    {
        const { stack } = await provider.get( "status", [] );

        return stack.readNumber();
    }

    async getReplacementGrade( provider: ContractProvider )
    {
        const { stack } = await provider.get( "get_replacement_grade", [] );

        return stack.readAddress();
    }

    async sendRemove( provider: ContractProvider, via: Sender, value: bigint )
    {
        await provider.internal(via, {
            value,
            body: beginCell()
                .storeUint( 0x00001234, 32 )
                .storeUint( 0, 64 )
            .endCell(),
        });
    }

    async sendReplace( provider: ContractProvider, via: Sender, value: bigint, newGradeValue: number, newGradeComment: string )
    {
        await provider.internal(via, {
            value,
            body: beginCell()
                .storeUint( 0x00005678, 32 )
                .storeUint( 0, 64 )
                .storeUint( newGradeValue, 8 )
                .storeSlice( 
                    beginCell()
                        .storeStringTail( newGradeComment )
                    .asSlice()
                )
            .endCell(),
        });
    }
}
