
export default function CoinSurge(originalCoins: number): { DoubleCoins: () => number } {
    const DoubleCoins = () => {

    const doubled = originalCoins * 2;

    console.log(`Double coins applied: +${doubled}`);
    return doubled;
    };

    return { DoubleCoins };
}
