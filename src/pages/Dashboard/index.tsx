import React, { useState, useMemo, useCallback } from 'react';

import ContentHeader from '../../components/ContentHeader';
import SelectInput from '../../components/SelectInput';
import WalletBox from '../../components/WalletBox';
import MessageBox from '../../components/MessageBox';
import PieChartBox from '../../components/PieChartBox';
import HistoryBox from '../../components/HistoryBox';
import BarChartBox from '../../components/BarChartBox';

import expenses from '../../repositories/expenses';
import gains from '../../repositories/gains';
import listOfmonths from '../../utils/months';

import happyImg from '../../assets/happy.svg';
import sadImg from '../../assets/sad.svg';
import grinningImg from '../../assets/grinning.svg';
import opsImg from '../../assets/ops.png';

import { Container, Content } from './styles';

const Dashboard: React.FC = () => {
    const [monthSelected, setMonthSelected] = useState<string>(
        String(new Date().getMonth() + 1).padStart(2, '0')
    );
    const [yearSelected, setYearSelected] = useState<string>(
        String(new Date().getFullYear())
    );

    // Converter os dados para garantir que amount seja um número
    const parsedExpenses = useMemo(() => {
        return expenses.map(item => ({
            ...item,
            amount: Number(item.amount),
        }));
    }, [expenses]);

    const parsedGains = useMemo(() => {
        return gains.map(item => ({
            ...item,
            amount: Number(item.amount),
        }));
    }, [gains]);

    const calculateTotal = (items: Array<{ date: string; amount: number }>): number => {
        return items.reduce((total, item) => {
            const date = new Date(item.date);
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = String(date.getFullYear());

            if (month === monthSelected && year === yearSelected) {
                total += item.amount;
            }

            return total;
        }, 0);
    };

    const years = useMemo(() => {
        let uniqueYears: number[] = [];
        [...parsedExpenses, ...parsedGains].forEach(item => {
            const year = new Date(item.date).getFullYear();
            if (!uniqueYears.includes(year)) {
                uniqueYears.push(year);
            }
        });
        return uniqueYears;
    }, [parsedExpenses, parsedGains]);

    const months = useMemo(() => {
        return listOfmonths.map((month, index) => ({
            value: String(index + 1).padStart(2, '0'),
            label: month,
        }));
    }, []);

    const totalExpenses = useMemo(() => calculateTotal(parsedExpenses), [parsedExpenses, monthSelected, yearSelected]);
    const totalGains = useMemo(() => calculateTotal(parsedGains), [parsedGains, monthSelected, yearSelected]);

    const totalBalance = useMemo(() => totalGains - totalExpenses, [totalGains, totalExpenses]);

    const message = useMemo(() => {
        if (totalBalance < 0) {
            return {
                title: "Que triste!",
                description: "Neste mês, você gastou mais do que deveria.",
                footerText: "Verifique seus gastos e evite coisas desnecessárias.",
                icon: sadImg,
            };

        }

        else if (totalGains === 0 && totalExpenses === 0) {
            return {
                title: "Op's!",
                description: "Neste mês, não há registros de entradas e saídas.",
                footerText: "Parece que você não fez nenhum registro no mês e ano selecionado.",
                icon: opsImg,
            }
        }

        else if (totalBalance === 0) {
            return {
                title: "Ufaa!",
                description: "Neste mês, você gastou exatamente o que ganhou.",
                footerText: "Tenha cuidado. No próximo mês tente poupar o seu dinheiro.",
                icon: grinningImg,
            }
        }

        else {
            return {
                title: "Muito bem!",
                description: "Sua carteira está positiva!",
                footerText: "Continue assim. Considere investir o seu saldo.",
                icon: happyImg,
            };
        }
    }, [totalBalance, totalGains, totalExpenses]);

    const relationExpensesVersusGains = useMemo(() => {
        const total = totalGains + totalExpenses;

        const percentGains = Number(((totalGains / total) * 100).toFixed(1));
        const percentExpenses = Number(((totalExpenses / total) * 100).toFixed(1));

        const data = [
            {
                name: "Entradas",
                value: totalGains,
                percent: percentGains ? percentGains : 0,
                color: '#F7931B'
            },
            {
                name: "Saídas",
                value: totalExpenses,
                percent: percentExpenses ? percentExpenses : 0,
                color: '#E44C4E'
            },
        ];

        return data;
    }, [totalGains, totalExpenses]);

    const historyData = useMemo(() => {
        return listOfmonths
            .map((_, month) => {
                let amountEntry = 0;
                gains.forEach(gain => {
                    const date = new Date(gain.date);
                    const gainMonth = date.getMonth();
                    const gainYear = date.getFullYear();

                    if (gainMonth === month && gainYear === Number(yearSelected)) {
                        amountEntry += Number(gain.amount);
                    }
                });

                let amountOutput = 0;
                expenses.forEach(expense => {
                    const date = new Date(expense.date);
                    const expenseMonth = date.getMonth();
                    const expenseYear = date.getFullYear();

                    if (expenseMonth === month && expenseYear === Number(yearSelected)) {
                        amountOutput += Number(expense.amount);
                    }
                });

                return {
                    monthNumber: month,
                    month: listOfmonths[month].substring(0, 3),
                    amountEntry,
                    amountOutput,
                };
            })
            .filter(item => item.monthNumber >= 0 && item.monthNumber <= 6);
    }, [yearSelected]);

    const relationExpensesRecurrentVersusEventual = useMemo(() => {
        let amountRecurrent = 0;
        let amountEventual = 0;

        expenses
            .filter((expense) => {
                const date = new Date(expense.date);
                const year = date.getFullYear();
                const month = date.getMonth() + 1;

                return month === Number(monthSelected) && year === Number(yearSelected);
            })
            .forEach((expense) => {
                if (expense.frequency === 'recorrente') {
                    return amountRecurrent += Number(expense.amount);
                }

                if (expense.frequency === 'eventual') {
                    return amountEventual += Number(expense.amount);
                }
            });

        const total = amountRecurrent + amountEventual;

        const percentRecurrent = Number(((amountRecurrent / total) * 100).toFixed(1));
        const percentEventual = Number(((amountRecurrent / total) * 100).toFixed(1));

        return [
            {
                name: 'Recorrentes',
                amount: amountRecurrent,
                percent: percentRecurrent ? percentRecurrent : 0,
                color: "#F7931B"
            },
            {
                name: 'Eventuais',
                amount: amountEventual,
                percent: percentEventual ? percentEventual : 0,
                color: "#E44C4E"
            }
        ];
    }, [monthSelected, yearSelected]);

    const relationGainsRecurrentVersusEventual = useMemo(() => {
        let amountRecurrent = 0;
        let amountEventual = 0;

        gains
            .filter((gain) => {
                const date = new Date(gain.date);
                const year = date.getFullYear();
                const month = date.getMonth() + 1;

                return month === Number(monthSelected) && year === Number(yearSelected);
            })
            .forEach((gain) => {
                if (gain.frequency === 'recorrente') {
                    return amountRecurrent += Number(gain.amount);
                }

                if (gain.frequency === 'eventual') {
                    return amountEventual += Number(gain.amount);
                }
            });

        const total = amountRecurrent + amountEventual;

        const percentRecurrent = Number(((amountRecurrent / total) * 100).toFixed(1));
        const percentEventual = Number(((amountRecurrent / total) * 100).toFixed(1));

        return [
            {
                name: 'Recorrentes',
                amount: amountRecurrent,
                percent: percentRecurrent ? percentRecurrent : 0,
                color: "#F7931B"
            },
            {
                name: 'Eventuais',
                amount: amountEventual,
                percent: percentEventual ? percentEventual : 0,
                color: "#E44C4E"
            }
        ];
    }, [monthSelected, yearSelected]);

    const handleMonthSelected = useCallback((month: string) => {
        const parseMonth = Number(month);
        if (parseMonth < 1 || parseMonth > 12) {
            alert('Invalid month value. Accepted range: 1 - 12.');
            return;
        }
        setMonthSelected(month);
    },[]);

    const handleYearSelected = useCallback((year: string) => {
        if (isNaN(Number(year))) {
            alert('Invalid year value. Accepted format: integer numbers.');
            return;
        }
        setYearSelected(year);
    },[]);

    return (
        <Container>
            <ContentHeader title="Dashboard" $lineColor='#F7931B'>
                <SelectInput
                    options={months}
                    onChange={(e) => handleMonthSelected(e.target.value)}
                    value={monthSelected}
                />
                <SelectInput
                    options={years.map(year => ({ value: String(year), label: String(year) }))}
                    onChange={(e) => handleYearSelected(e.target.value)}
                    value={yearSelected}
                />
            </ContentHeader>

            <Content>
                <WalletBox
                    title="saldo"
                    color="#4E41F0"
                    amount={totalBalance}
                    footerlabel="Atualizado com base nas entradas e saídas"
                    icon="dolar"
                />

                <WalletBox
                    title="entradas"
                    color="#F7931B"
                    amount={totalGains}
                    footerlabel="Atualizado com base nas entradas e saídas"
                    icon="arrowUp"
                />

                <WalletBox
                    title="saídas"
                    color="#E44C4E"
                    amount={totalExpenses}
                    footerlabel="Atualizado com base nas entradas e saídas"
                    icon="arrowDown"
                />

                <MessageBox
                    title={message.title}
                    description={message.description}
                    footerText={message.footerText}
                    icon={message.icon}
                />

                <PieChartBox data={relationExpensesVersusGains} />

                <HistoryBox
                    data={historyData}
                    lineColorAmountEntry="#F7931B"
                    lineColorAmountOutput="#E44C4E"
                />

                <BarChartBox
                    title="Saídas"
                    data={relationExpensesRecurrentVersusEventual}
                />

                <BarChartBox
                    title="Entradas"
                    data={relationGainsRecurrentVersusEventual}
                />
            </Content>
        </Container>
    );
}

export default Dashboard;