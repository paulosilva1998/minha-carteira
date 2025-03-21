import styled, {keyframes} from 'styled-components';

const animate = keyframes`
    0% {
        transform: translateX(-100px);
        opacity: 0;
    }
    50% {
        opacity: .3;
    }
    100% {
        transform: translateX(0px);
        opacity: 1;
    }
`;

export const Container = styled.div`
    animation: ${animate} .5s;
`;

export const Content = styled.div`
    display: flex;

    justify-content: space-between;
    flex-wrap: wrap;
`;