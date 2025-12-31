import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, RefreshControl } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const NotificationScreen = () => {
    const { token } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        try {
            const data = await api('/notifications', { token });
            setNotifications(data);
        } catch (error) {
            console.error(error);
        }
    };

    const markRead = async (id) => {
        try {
            await api('/notifications/read', {
                method: 'POST',
                body: JSON.stringify({ id }),
                token
            });
            fetchNotifications(); // Refresh to update UI
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchNotifications();
        setRefreshing(false);
    };

    const renderItem = ({ item }) => (
        <View style={[styles.card, item.is_read ? styles.read : styles.unread]}>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
            {!item.is_read && <Button title="Mark Read" onPress={() => markRead(item.id)} />}
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={<Text style={{ padding: 20 }}>No notifications.</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10 },
    card: { padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#ccc' },
    unread: { backgroundColor: '#e3f2fd' },
    read: { backgroundColor: '#f9f9f9' },
    message: { fontSize: 16, marginBottom: 5 },
    date: { fontSize: 12, color: 'gray', marginBottom: 10 }
});

export default NotificationScreen;
