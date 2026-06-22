import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal, FlatList, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlaylistStore } from '../store/playlistStore';
import { parseEPG } from '../lib/epgParser';
import { getCachedData, cacheData } from '../lib/storage';
import EPGProgramCard from '../components/EPGProgramCard';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const today = new Date();
const DATES = DAYS.map((d, i) => {
  const dt = new Date(today);
  dt.setDate(today.getDate() + i);
  return `${d} ${dt.getDate()}`;
});

interface Props {
  navigation: any;
}

export default function GuideScreen({ navigation }: Props) {
  const { channels, activePlaylist } = usePlaylistStore();
  const [selectedDate, setSelectedDate] = useState(0);
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEPG();
  }, [activePlaylist]);

  const loadEPG = async () => {
    setLoading(true);
    if (activePlaylist?.epg_url) {
      const cached = await getCachedData<any[]>(`epg_${activePlaylist.id}`);
      if (cached) {
        setPrograms(cached);
      } else {
        try {
          const res = await fetch(activePlaylist.epg_url, { signal: AbortSignal.timeout(10000) });
          const xml = await res.text();
          const parsed = parseEPG(xml);
          if (parsed.programs.length > 0) {
            setPrograms(parsed.programs);
            await cacheData(`epg_${activePlaylist.id}`, parsed.programs, 3600000);
          }
        } catch {}
      }
    }
    setLoading(false);
  };

  const getProgramsForChannel = (tvgId: string | undefined) => {
    if (!tvgId || programs.length === 0) return [];
    const now = new Date();
    const dayStart = new Date(now);
    dayStart.setDate(now.getDate() + selectedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);

    return programs
      .filter((p) => {
        if (p.channel_tvg_id !== tvgId) return false;
        const start = new Date(p.start_time);
        return start >= dayStart && start < dayEnd;
      })
      .sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, 10);
  };

  const isLiveNow = (prog: any) => {
    const now = new Date();
    return new Date(prog.start_time) <= now && new Date(prog.end_time) >= now;
  };

  return (
    <View className="flex-1 bg-[#050816]">
      <View className="pt-14 px-5 pb-2">
        <Text className="text-[#F8FAFC] text-3xl font-extrabold">TV Guide</Text>
      </View>

      <FlatList
        horizontal
        data={DATES}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        className="max-h-11 mb-3"
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            className={`px-4 py-2 rounded-full border ${index === selectedDate ? 'bg-[#00AEEF] border-[#00AEEF]' : 'bg-[#101827] border-white/10'}`}
            onPress={() => setSelectedDate(index)}
          >
            <Text className={`text-xs font-semibold ${index === selectedDate ? 'text-white' : 'text-[#94A3B8]'}`}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={loading} onRefresh={loadEPG} tintColor="#00AEEF" />}>
        {channels.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="calendar-outline" size={48} color="#64748B" />
            <Text className="text-[#94A3B8] text-lg mt-4 text-center">No EPG data available</Text>
            <Text className="text-[#64748B] text-sm text-center mt-2">Add an EPG URL to your playlist</Text>
          </View>
        ) : (
          channels.slice(0, 10).map((ch, i) => {
            const chPrograms = getProgramsForChannel(ch.tvgId);
            return (
              <View key={i} className="mb-2">
                <View className="flex-row items-center px-5 py-2 gap-2">
                  <View className="w-2 h-2 rounded-full bg-[#00AEEF]" />
                  <Text className="text-[#F8FAFC] text-sm font-bold">{ch.name}</Text>
                </View>
                {chPrograms.length > 0 ? (
                  chPrograms.map((prog, j) => (
                    <EPGProgramCard
                      key={j}
                      title={prog.title}
                      startTime={prog.start_time}
                      endTime={prog.end_time}
                      description={prog.description}
                      isLive={isLiveNow(prog)}
                      onPress={() => {
                        setSelectedProgram(prog);
                        setModalVisible(true);
                      }}
                    />
                  ))
                ) : (
                  <Text className="text-[#64748B] text-xs pl-14 py-2">No program data</Text>
                )}
              </View>
            );
          })
        )}
        <View className="h-24" />
      </ScrollView>

      {/* Program Detail Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-[#101827] rounded-t-3xl p-6 shadow-lg">
            <View className="w-10 h-1 rounded-full bg-[#64748B] self-center mb-5" />
            {selectedProgram && (
              <>
                <View className="flex-row items-center justify-between">
                  <Text className="text-[#F8FAFC] text-2xl font-extrabold flex-1">{selectedProgram.title}</Text>
                  {isLiveNow(selectedProgram) && (
                    <View className="flex-row items-center bg-red-500 px-2.5 py-1 rounded gap-1.5">
                      <View className="w-1.5 h-1.5 rounded-full bg-white" />
                      <Text className="text-white text-[10px] font-bold">LIVE</Text>
                    </View>
                  )}
                </View>
                <View className="flex-row items-center gap-2 mt-4">
                  <Ionicons name="time-outline" size={16} color="#94A3B8" />
                  <Text className="text-[#94A3B8] text-sm">
                    {new Date(selectedProgram.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {' - '}
                    {new Date(selectedProgram.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                {selectedProgram.category && (
                  <View className="flex-row items-center gap-2 mt-2">
                    <Ionicons name="pricetag-outline" size={16} color="#94A3B8" />
                    <Text className="text-[#94A3B8] text-sm">{selectedProgram.category}</Text>
                  </View>
                )}
                {selectedProgram.description && (
                  <Text className="text-[#94A3B8] text-sm leading-6 mt-4">{selectedProgram.description}</Text>
                )}
                <TouchableOpacity
                  className="bg-[#00AEEF] rounded-xl py-3.5 items-center mt-6"
                  onPress={() => setModalVisible(false)}
                >
                  <Text className="text-white font-bold text-base">Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
