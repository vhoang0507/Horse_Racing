import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { horseAPI, tournamentAPI, raceAPI, resultAPI, userAPI, betAPI, notificationAPI, invitationAPI } from '../services/api';
import toast from 'react-hot-toast';

// ---- Horses ----
export const useHorses = (params) =>
  useQuery({ queryKey: ['horses', params], queryFn: () => horseAPI.getAll(params).then(r => r.data.data) });

export const useHorse = (id) =>
  useQuery({ queryKey: ['horse', id], queryFn: () => horseAPI.getById(id).then(r => r.data.data), enabled: !!id });

export const useCreateHorse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: horseAPI.create,
    onSuccess: () => { qc.invalidateQueries(['horses']); toast.success('Horse created!'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });
};

export const useUpdateHorse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => horseAPI.update(id, data),
    onSuccess: () => { qc.invalidateQueries(['horses']); toast.success('Horse updated!'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });
};

export const useDeleteHorse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: horseAPI.delete,
    onSuccess: () => { qc.invalidateQueries(['horses']); toast.success('Horse deleted!'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });
};

// ---- Tournaments ----
export const useTournaments = () =>
  useQuery({ queryKey: ['tournaments'], queryFn: () => tournamentAPI.getAll().then(r => r.data.data) });

export const useTournament = (id) =>
  useQuery({ queryKey: ['tournament', id], queryFn: () => tournamentAPI.getById(id).then(r => r.data.data), enabled: !!id });

export const useCreateTournament = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tournamentAPI.create,
    onSuccess: () => { qc.invalidateQueries(['tournaments']); toast.success('Tournament created!'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });
};

export const useUpdateTournament = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => tournamentAPI.update(id, data),
    onSuccess: () => { qc.invalidateQueries(['tournaments']); toast.success('Tournament updated!'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });
};

export const useDeleteTournament = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tournamentAPI.delete,
    onSuccess: () => { qc.invalidateQueries(['tournaments']); toast.success('Deleted!'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });
};

// ---- Races ----
export const useRaces = (params) =>
  useQuery({ queryKey: ['races', params], queryFn: () => raceAPI.getAll(params).then(r => r.data.data) });

export const useRace = (id) =>
  useQuery({ queryKey: ['race', id], queryFn: () => raceAPI.getById(id).then(r => r.data.data), enabled: !!id });

export const useCreateRace = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: raceAPI.create,
    onSuccess: () => { qc.invalidateQueries(['races']); toast.success('Race created!'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });
};

export const useUpdateRace = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => raceAPI.update(id, data),
    onSuccess: () => { qc.invalidateQueries(['races']); toast.success('Race updated!'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });
};

export const useDeleteRace = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: raceAPI.delete,
    onSuccess: () => { qc.invalidateQueries(['races']); toast.success('Race deleted!'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });
};

// ---- Results ----
export const useResults = () =>
  useQuery({ queryKey: ['results'], queryFn: () => resultAPI.getAll().then(r => r.data.data) });

export const useRaceResult = (raceId) =>
  useQuery({ queryKey: ['result', raceId], queryFn: () => resultAPI.getByRace(raceId).then(r => r.data.data), enabled: !!raceId });

export const useCreateResult = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: resultAPI.create,
    onSuccess: () => { qc.invalidateQueries(['results', 'races']); toast.success('Result submitted!'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });
};

// ---- Users & Leaderboard ----
export const useLeaderboard = () =>
  useQuery({ queryKey: ['leaderboard'], queryFn: () => userAPI.getLeaderboard().then(r => r.data.data), refetchInterval: 30000 });

export const useUsers = (params) =>
  useQuery({ queryKey: ['users', params], queryFn: () => userAPI.getAll(params).then(r => r.data.data) });

export const useUserStats = () =>
  useQuery({ queryKey: ['userStats'], queryFn: () => userAPI.getStats().then(r => r.data.data) });

export const useJockeys = () =>
  useQuery({ queryKey: ['jockeys'], queryFn: () => userAPI.getJockeys().then(r => r.data.data) });

// ---- Bets ----
export const useMyBets = () =>
  useQuery({ queryKey: ['myBets'], queryFn: () => betAPI.getMy().then(r => r.data.data) });

export const useCreateBet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: betAPI.create,
    onSuccess: () => { qc.invalidateQueries(['myBets']); toast.success('Prediction placed!'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });
};

// ---- Notifications ----
export const useNotifications = () =>
  useQuery({ queryKey: ['notifications'], queryFn: () => notificationAPI.getMy().then(r => r.data.data), refetchInterval: 20000 });

// ---- Invitations ----
export const useInvitations = () =>
  useQuery({ queryKey: ['invitations'], queryFn: () => invitationAPI.getAll().then(r => r.data.data) });

export const useCreateInvitation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: invitationAPI.create,
    onSuccess: () => { qc.invalidateQueries(['invitations']); toast.success('Jockey invitation sent!'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to send invitation'),
  });
};

export const useRespondInvitation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, response }) => invitationAPI.respond(id, response),
    onSuccess: () => { qc.invalidateQueries(['invitations', 'notifications']); toast.success('Response submitted!'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to submit response'),
  });
};

export const useConfirmInvitation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: invitationAPI.confirm,
    onSuccess: () => { qc.invalidateQueries(['invitations', 'horses', 'notifications']); toast.success('Jockey choice confirmed!'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to confirm jockey'),
  });
};
