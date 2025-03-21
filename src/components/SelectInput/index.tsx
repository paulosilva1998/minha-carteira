import React from 'react';

import { Container } from './styles';

interface ISelectInputProps {
    options: { value: string | number; label: string }[];
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    value: string | number;
    defaultValue?: string | number;
}

const SelectInput: React.FC<ISelectInputProps> = ({ options, onChange, value, defaultValue }) => {
    return (
        <Container>
            <select onChange={onChange} value={value} defaultValue={defaultValue}>
                {
                    options.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))
                }
            </select>
        </Container>
    );
}

export default SelectInput;