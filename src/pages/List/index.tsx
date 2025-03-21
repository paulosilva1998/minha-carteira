import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import ContentHeader from '../../components/ContentHeader';
import SelectInput from '../../components/SelectInput';
import HistoryFinanceCard from '../../components/HistoryFinanceCard';

import gains from '../../repositories/gains';
import expenses from '../../repositories/expenses';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';
import listOfmonths from '../../utils/months';

import { Container, Content, Filters } from './styles';

interface IData {
    id: string;
    description: string;
    amountFormatted: string;
    frequency: string;
    dateFormatted: string;
    tagColor: string;
}

const List: React.FC = () => {
    const [data, setData] = useState<IData[]>([]);
    const [monthSelected, setMonthSelected] = useState<string>(
        String(new Date().getMonth() + 1).padStart(2, '0')
    );
    const [yearSelected, setYearSelected] = useState<string>(
        String(new Date().getFullYear())
    );
    const [frequencyFilterSelected, setFrequencyFilterSelected] = useState(['recorrente', 'eventual']);

    const { type } = useParams<{ type: string }>();

    const title = useMemo(() => {
        if (type === 'entry-balance') return 'Entradas';
        if (type === 'exit-balance') return 'Saídas';
        return 'Listagem';
    }, [type]);

    const lineColor = useMemo(() => {
        if (type === 'entry-balance') return '#4E41F0';
        if (type === 'exit-balance') return '#E44C4E';
        return '#000';
    }, [type]);

    const listData = useMemo(() => {
        if (type === 'entry-balance') return gains;
        if (type === 'exit-balance') return expenses;
        return [];
    }, [type]);

    const years = useMemo(() => {
        let uniqueYears: number[] = [];
        listData.forEach(item => {
            const date = new Date(item.date);
            const year = date.getFullYear();
            if (!uniqueYears.includes(year)) {
                uniqueYears.push(year);
            }
        });
        return uniqueYears;
    }, [listData]);

    const months = useMemo(() => {
        return listOfmonths.map((month, index) => ({
            value: String(index + 1).padStart(2, '0'),
            label: month,
        }));
    }, []);

    const handleFrequencyClick = (frequency: string) => {
        const alreadySelected = frequencyFilterSelected.findIndex(item => item === frequency);

        if (alreadySelected >= 0) {
            const filtered = frequencyFilterSelected.filter(item => item !== frequency);
            setFrequencyFilterSelected(filtered);
        } else {
            setFrequencyFilterSelected((prev) => [...prev, frequency]);
        }
    };

    useEffect(() => {
        const filteredData = listData.filter(item => {
            const date = new Date(item.date);
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = String(date.getFullYear());

            return (
                month === monthSelected &&
                year === yearSelected &&
                frequencyFilterSelected.includes(item.frequency)
            );
        });

        const formattedData = filteredData.map(item => ({
            id: uuidv4(),
            description: item.description,
            amountFormatted: formatCurrency(Number(item.amount)),
            frequency: item.frequency,
            dateFormatted: formatDate(item.date),
            tagColor: item.frequency === 'recorrente' ? '#4E41F0' : '#E44C4E', // Azul para "Recorrentes" e vermelho para "Eventuais"
        }));

        setData(formattedData);
    }, [listData, monthSelected, yearSelected, frequencyFilterSelected]);

    return (
        <Container>
            <ContentHeader title={title} $lineColor={lineColor}>
                <SelectInput
                    options={months}
                    onChange={(e) => setMonthSelected(e.target.value)}
                    value={monthSelected}
                />
                <SelectInput
                    options={years.map(year => ({ value: String(year), label: String(year) }))}
                    onChange={(e) => setYearSelected(e.target.value)}
                    value={yearSelected}
                />
            </ContentHeader>

            <Filters>
                <button
                    type="button"
                    className={`tag-filter tag-filter-recurrent ${frequencyFilterSelected.includes('recorrente') && 'tag-actived'
                        }`}
                    onClick={() => handleFrequencyClick('recorrente')}
                >
                    Recorrentes
                </button>
                <button
                    type="button"
                    className={`tag-filter tag-filter-eventual ${frequencyFilterSelected.includes('eventual') && 'tag-actived'
                        }`}
                    onClick={() => handleFrequencyClick('eventual')}
                >
                    Eventuais
                </button>
            </Filters>

            <Content>
                {data.map(item => (
                    <HistoryFinanceCard
                        key={item.id}
                        tagColor={item.tagColor}
                        title={item.description}
                        subtitle={item.dateFormatted}
                        amount={item.amountFormatted}
                    />
                ))}
            </Content>
        </Container>
    );
};

export default List;