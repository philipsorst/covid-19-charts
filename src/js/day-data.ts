export class DayData
{
    constructor(public date: Date)
    {
    }

    deaths: number = 0;
    recovered: number = 0;
    confirmed: number = 0;
    growthRate: number = 0;
}
