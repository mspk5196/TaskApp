import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import theme from '../styles/theme';

const CalendarScreen = () => {
    const { token } = useAuth();
    const [slots, setSlots] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [refreshing, setRefreshing] = useState(false);

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const workingHours = hours.slice(8, 17); // 8:30 AM to 5:00 PM default view

    const fetchSlots = async () => {
        try {
            const data = await api('/calendar/slots', { token });
            setSlots(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchSlots();
    }, [selectedDate]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchSlots();
        setRefreshing(false);
    };

    const getSlotForHour = (hour) => {
        return slots.find(slot => {
            const slotHour = new Date(slot.start_time).getHours();
            return slotHour === hour;
        });
    };

    const formatHour = (hour) => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:00 ${period}`;
    };

    const renderHourCard = (hour) => {
        const slot = getSlotForHour(hour);
        const isWorkingHour = hour >= 8 && hour < 17;

        return (
            <TouchableOpacity 
                key={hour}
                style={[
                    styles.hourCard,
                    !isWorkingHour && styles.nonWorkingHour,
                    slot && styles.occupiedHour
                ]}
                activeOpacity={0.7}
            >
                <View style={styles.hourHeader}>
                    <Text style={styles.hourTime}>{formatHour(hour)}</Text>
                    {slot && (
                        <Badge 
                            text={slot.status} 
                            variant={slot.status === 'RESERVED' ? 'accepted' : 'default'}
                            size="sm"
                        />
                    )}
                </View>

                {slot ? (
                    <View style={styles.slotContent}>
                        <Text style={styles.slotTitle} numberOfLines={1}>
                            {slot.task_title || 'Task'}
                        </Text>
                        <Text style={styles.slotType}>{slot.slot_type}</Text>
                    </View>
                ) : (
                    <View style={styles.emptySlot}>
                        <Text style={styles.emptyText}>Free</Text>
                    </View>
                )}

                {/* Subdivision indicators */}
                <View style={styles.subdivisions}>
                    <View style={styles.subdivision} />
                    <View style={styles.subdivision} />
                    <View style={styles.subdivision} />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Calendar</Text>
                    <Text style={styles.headerDate}>
                        {selectedDate.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </Text>
                </View>
                <TouchableOpacity style={styles.todayButton}>
                    <Text style={styles.todayText}>Today</Text>
                </TouchableOpacity>
            </View>

            {/* Timeline */}
            <ScrollView 
                style={styles.timeline}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.timelineContent}>
                    {/* Working hours section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Working Hours (8:30 AM - 5:00 PM)</Text>
                        {workingHours.map(renderHourCard)}
                    </View>

                    {/* Extended hours */}
                    <TouchableOpacity style={styles.expandButton}>
                        <Text style={styles.expandText}>Show Full 24-Hour Timeline</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: theme.colors.success }]} />
                    <Text style={styles.legendText}>Free</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
                    <Text style={styles.legendText}>Reserved</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: theme.colors.gray300 }]} />
                    <Text style={styles.legendText}>Non-Working</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.gray50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.white,
        ...theme.shadows.sm,
    },
    headerTitle: {
        ...theme.typography.h2,
        color: theme.colors.gray900,
    },
    headerDate: {
        ...theme.typography.bodySmall,
        color: theme.colors.gray500,
        marginTop: 2,
    },
    todayButton: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.primary,
    },
    todayText: {
        color: theme.colors.white,
        fontWeight: '600',
    },
    timeline: {
        flex: 1,
    },
    timelineContent: {
        padding: theme.spacing.md,
    },
    section: {
        marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
        ...theme.typography.bodySmall,
        fontWeight: '600',
        color: theme.colors.gray600,
        marginBottom: theme.spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    hourCard: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.success,
        ...theme.shadows.sm,
    },
    nonWorkingHour: {
        backgroundColor: theme.colors.gray100,
        borderLeftColor: theme.colors.gray300,
    },
    occupiedHour: {
        borderLeftColor: theme.colors.primary,
        backgroundColor: theme.colors.primaryLight + '10',
    },
    hourHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xs,
    },
    hourTime: {
        ...theme.typography.h4,
        color: theme.colors.gray900,
    },
    slotContent: {
        marginTop: theme.spacing.xs,
    },
    slotTitle: {
        ...theme.typography.body,
        fontWeight: '600',
        color: theme.colors.gray900,
        marginBottom: 2,
    },
    slotType: {
        ...theme.typography.caption,
        color: theme.colors.gray500,
    },
    emptySlot: {
        paddingVertical: theme.spacing.xs,
    },
    emptyText: {
        ...theme.typography.bodySmall,
        color: theme.colors.gray400,
        fontStyle: 'italic',
    },
    subdivisions: {
        flexDirection: 'row',
        marginTop: theme.spacing.sm,
        gap: 2,
    },
    subdivision: {
        flex: 1,
        height: 2,
        backgroundColor: theme.colors.gray200,
        borderRadius: 1,
    },
    expandButton: {
        padding: theme.spacing.md,
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.md,
        ...theme.shadows.sm,
    },
    expandText: {
        ...theme.typography.body,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.white,
        borderTopWidth: 1,
        borderTopColor: theme.colors.gray200,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: theme.spacing.xs,
    },
    legendText: {
        ...theme.typography.caption,
        color: theme.colors.gray600,
    },
});

export default CalendarScreen;
