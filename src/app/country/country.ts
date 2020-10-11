export class Country
{
    constructor(
        public code: string,
        public name: string,
        public population: number | null = null,
        public area: number | null = null,
        public hostCountryCode: string | null = null,
        public isSovereign: boolean = true,
        public isDisputed: boolean = false
    )
    {
    }
}
