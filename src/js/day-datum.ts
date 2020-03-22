import * as d3 from "d3";

export class DayDatum
{
    constructor(public date: Date)
    {
    }

    deaths: number = 0;
    recovered: number = 0;
    confirmed: number = 0;
    previous: DayDatum | null = null;
    next: DayDatum | null = null;

    public getPending(): number
    {
        return this.confirmed - this.recovered - this.deaths;
    }

    public getDeathRate(): number
    {
        if (this.deaths + this.recovered === 0) {
            return 0;
        }
        return this.deaths / (this.deaths + this.recovered);
    }

    public getConfirmedGrowthRate(): number
    {
        if (null == this.previous) {
            return 0;
        }

        return (this.confirmed - this.previous.confirmed) / this.previous.confirmed;
    }

    public getPendingGrowthRate(): number
    {
        if (null == this.previous) {
            return 0;
        }

        return (this.getPending() - this.previous.getPending()) / this.previous.getPending();
    }

    public getGrowthChangeRate(): number | null
    {
        if (this.previous == null) {
            return null;
        }

        const lastGrowth = this.previous.getGrowth();
        if (null == lastGrowth) {
            return null;
        }

        if (0 === lastGrowth) {
            return 0;
        }

        const currentGrowth = this.getGrowth() as number;

        return currentGrowth / lastGrowth;
    }

    public getMovingAverage(accessor: () => (number | null), size: number = 1): number | null
    {
        const values = new Array<number>();
        const currentValue = accessor.call(this);
        let weight = 0;
        let weightSum = 0;
        if (null == currentValue) {
            return null;
        }
        weight = size + 1;
        weightSum += weight;
        values.push(currentValue * weight);

        let currentPrevious: DayDatum = this;
        let currentNext: DayDatum = this;
        for (let i = 0; i < size; i++) {
            if (null == currentPrevious.previous || null == currentNext.next) {
                return null;
            }

            currentPrevious = currentPrevious.previous;
            const previousValue = accessor.call(currentPrevious);

            weight = size - i;
            weightSum += 2 * weight;

            if (null != previousValue) {

                values.push(previousValue * weight)
            }

            currentNext = currentNext.next;
            const nextValue = accessor.call(currentNext);
            if (null != nextValue) {
                values.push(nextValue * weight)
            }
        }

        return d3.sum(values) as number / weightSum;
    }

    public getGrowth(): number | null
    {
        if (null == this.previous) {
            return null;
        }
        return this.confirmed - this.previous.confirmed;
    }

    public getGrowthChange(): number | null
    {
        if (null == this.previous) {
            return null;
        }
        const previousGrowth = this.getGrowth();
        const currentGrowth = this.previous.getGrowth();
        if (null == previousGrowth || null == currentGrowth) {
            return null;
        }

        return currentGrowth - previousGrowth;
    }

    public getConfirmed(): number
    {
        return this.confirmed;
    }

    public getRecovered(): number
    {
        return this.recovered;
    }

    public getDeaths(): number
    {
        return this.deaths;
    }
}
