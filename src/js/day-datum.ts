import * as d3 from "d3";

export class DayDatum
{
    constructor(public date: Date)
    {
    }

    deaths: number = 0;
    recovered: number = 0;
    confirmed: number = 0;
    pending: number = 0;
    previous: DayDatum | null = null;
    next: DayDatum | null = null;

    public getPrevious(numDays: number = 1): DayDatum | null
    {
        return this.getPreviousInternal(numDays, 0);
    }

    private getPreviousInternal(numDays: number, numDaysSeen: number): DayDatum | null
    {
        if (numDays === numDaysSeen) {
            return this;
        }

        const previous = this.previous;
        if (null == previous) {
            return null;
        }

        return previous.getPreviousInternal(numDays, numDaysSeen + 1);
    }

    public getNext(numDays: number = 1): DayDatum | null
    {
        return this.getNextInternal(numDays, 0);
    }

    private getNextInternal(numDays: number, numDaysSeen: number): DayDatum | null
    {
        if (numDays === numDaysSeen) {
            return this;
        }

        const next = this.next;
        if (null == next) {
            return null;
        }

        return next.getNextInternal(numDays, numDaysSeen + 1);
    }

    public getPending(): number
    {
        // return this.pending;
        return this.confirmed - this.recovered - this.deaths;
    }

    public getDeathRate(): number
    {
        // if (this.deaths + this.recovered === 0) {
        //     return 0;
        // }
        // return this.deaths / (this.deaths + this.recovered);
        if (this.confirmed === 0) {
            return 0;
        }

        return this.deaths / this.confirmed;
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
        let current: DayDatum = this;
        let weightSum = 0;
        for (let i = 0; i <= size; i++) {
            let currentValue = accessor.call(current);
            if (null == currentValue) {
                return null;
            }
            if (null == current.previous) {
                return null;
            }
            const weight = size + 1 - 1;
            values.push(currentValue * weight);
            weightSum += weight;
            current = current.previous;
        }

        return d3.sum(values) as number / weightSum;
    }

    public getMovingMedianCentered(accessor: () => (number | null), size: number = 1, excludeZero: boolean = false): number | null
    {
        const values = new Array<number>();
        const currentValue = accessor.call(this);
        if (null == currentValue || (excludeZero && 0 === currentValue)) return null;

        for (let i = 1; i <= size; i++) {
            const previous = this.getPrevious(i);
            if (null == previous) return null;
            const previousValue = accessor.call(previous);
            if (null == previousValue || (excludeZero && 0 === previousValue)) return null;
            values.push(previousValue);
        }

        for (let i = 1; i <= size; i++) {
            const next = this.getNext(i);
            if (null == next) return null;
            const nextValue = accessor.call(next);
            if (null == nextValue || (excludeZero && 0 === nextValue)) return null;
            values.push(nextValue);
        }

        return d3.median(values) as number;
    }

    public getMovingAverageCentered(accessor: () => (number | null), size: number = 1, excludeZero: boolean = false): number | null
    {
        const values = new Array<number>();
        const currentValue = accessor.call(this);
        let weight = 0;
        let weightSum = 0;
        if (null == currentValue || (excludeZero && 0 === currentValue)) {
            return null;
        }
        weight = size + 1;
        weightSum += weight;
        values.push(currentValue * weight);

        let currentPrevious: DayDatum = this;
        let currentNext: DayDatum = this;
        for (let i = 0; i < size; i++) {
            if (null == currentPrevious.previous || null == currentNext.next) return null;

            weight = size - i;
            weightSum += 2 * weight;

            currentPrevious = currentPrevious.previous;
            const previousValue = accessor.call(currentPrevious);
            if (null == previousValue || (excludeZero && 0 === previousValue)) return null;
            values.push(previousValue * weight);

            currentNext = currentNext.next;
            const nextValue = accessor.call(currentNext);
            if (null == nextValue || (excludeZero && 0 === nextValue)) return null;
            values.push(nextValue * weight);
        }

        return d3.sum(values) as number / weightSum;
    }

    public getNetReproductionNumber(): number | null
    {
        const incubationDays = 6;
        const infectiousDays = 14;

        const yesterday = this.getPrevious();
        const incubationAgo = this.getPrevious(incubationDays);
        const infectiousDaysAgo = this.getPrevious(infectiousDays);
        if (null == yesterday || null == incubationAgo || null == infectiousDaysAgo) return null;

        if (0 === infectiousDaysAgo.getPending()) {
            return 0;
        }

        const val = Math.max(0, (this.getConfirmed() - infectiousDaysAgo.getConfirmed()) / infectiousDaysAgo.getPending());

        // console.log('NRN', this.date, this.confirmed - yesterday.confirmed, incubationAgo.pending, val);
        return val;
    }

    public getGrowth(): number | null
    {
        if (null == this.previous) {
            return null;
        }

        return this.getConfirmed() - this.previous.getConfirmed();
    }

    public getPendingGrowth(): number | null
    {
        if (null == this.previous) {
            return null;
        }

        return this.getPending() - this.previous.getPending();
    }

    public getDeathGrowth(): number | null
    {
        if (null == this.previous) {
            return null;
        }

        return this.getDeaths() - this.previous.getDeaths();
    }

    public getGrowthChange(): number | null
    {
        if (null == this.previous) {
            return null;
        }
        const currentGrowth = this.getGrowth();
        const previousGrowth = this.previous.getGrowth();
        if (null == previousGrowth || null == currentGrowth) {
            return null;
        }

        return currentGrowth - previousGrowth;
    }

    public getGrowthPercentage(): number | null
    {
        const previous = this.getPrevious(1);
        if (null == previous) {
            return null;
        }

        if (previous.getPending() === 0) {
            return 0;
        }

        const change = this.getPending() - previous.getPending();

        return change / previous.getPending();
    }

    public getGrowthPercentageChange(): number | null
    {
        if (null == this.previous) {
            return null;
        }
        const currentGrowth = this.getGrowthPercentage();
        const previousGrowth = this.previous.getGrowthPercentage();
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
        // return this.confirmed - this.pending - this.deaths;
        return this.recovered;
    }

    public getDeaths(): number
    {
        return this.deaths;
    }
}
