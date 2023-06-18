import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type TonStudyTeacherConfig = {};

export function tonStudyTeacherConfigToCell(config: TonStudyTeacherConfig): Cell {
    return beginCell().endCell();
}

export class TonStudyTeacher implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new TonStudyTeacher(address);
    }

    static createFromConfig(config: TonStudyTeacherConfig, code: Cell, workchain = 0) {
        const data = tonStudyTeacherConfigToCell(config);
        const init = { code, data };
        return new TonStudyTeacher(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
