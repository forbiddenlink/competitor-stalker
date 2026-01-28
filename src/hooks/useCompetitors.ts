import { useContext } from 'react';
import { CompetitorContext } from '../context/CompetitorContext';

export const useCompetitors = () => {
    const context = useContext(CompetitorContext);
    if (context === undefined) {
        throw new Error('useCompetitors must be used within a CompetitorProvider');
    }
    return context;
};
