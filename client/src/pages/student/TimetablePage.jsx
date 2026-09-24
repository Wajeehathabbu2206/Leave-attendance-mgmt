import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import PageLayout from '../../components/PageLayout';
import TimetableGrid from '../../components/TimetableGrid';
import api from '../../services/api';

export default function TimetablePage() {
  const [timetable, setTimetable] = useState(null); const [error, setError] = useState('');
  useEffect(() => { api.get('/student/timetable').then(({ data }) => setTimetable(data.data)).catch((err) => setError(err.response?.data?.message || 'Unable to load timetable')); }, []);
  return <PageLayout><div className="mb-6"><p className="overview-kicker">Student timetable</p><h1 className="overview-title">Your week at a glance</h1></div>{error && <p className="error-message">{error}</p>}{!timetable && !error ? <LoadingSpinner /> : <TimetableGrid timetable={timetable || []} />}</PageLayout>;
}