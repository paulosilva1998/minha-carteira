import React, { useMemo } from 'react';

import CountUp from 'react-countup';

import formatCurrency from '../../utils/formatCurrency';

import dolarImg from '../../assets/dolar.svg';
import arrowUpImg from '../../assets/arrow-up.svg';
import arrowDownImg from '../../assets/arrow-down.svg';

import { Container } from './styles';

interface IWalletBoxProps {
    title: string;
    amount: number;
    footerlabel: string;
    icon: 'dolar' | 'arrowUp' | 'arrowDown';
    color: string;
}

const WalletBox: React.FC<IWalletBoxProps> = ({
    title,
    amount,
    footerlabel,
    icon, 
    color
}) => {
    const iconSelected = useMemo(() => {
        switch (icon) {
            case 'dolar':
                return dolarImg;
            case 'arrowUp':
                return arrowUpImg;
            case 'arrowDown':
                return arrowDownImg;
            default:
                return undefined;
        }
    }, [icon]);

    return (
        <Container color={color}>
            <span>{title}</span>
            <h1>
                <CountUp
                    end={amount}
                    formattingFn={formatCurrency} // Usa a função de formatação customizada
                    decimals={2}
                />
            </h1>
            <small>{footerlabel || 'Nenhuma informação disponível'}</small>
            <img src={iconSelected || ''} alt={title || 'Ícone'} />     
        </Container>
    );
};

export default WalletBox;