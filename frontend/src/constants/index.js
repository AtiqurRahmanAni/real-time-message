import Vo_phantom_assassin_phass_spawn_01_mp3_mpeg from "../assets/notifications/Vo_phantom_assassin_phass_spawn_01.mp3.mpeg";
import Vo_phantom_assassin_phass_spawn_03_mp3_mpeg from "../assets/notifications/Vo_phantom_assassin_phass_spawn_03.mp3.mpeg";
import Vo_pudge_pud_ability_devour_02_mp3_mpeg from "../assets/notifications/Vo_pudge_pud_ability_devour_02.mp3.mpeg";
import Vo_pudge_pud_ability_hook_02_mp3_mpeg from "../assets/notifications/Vo_pudge_pud_ability_hook_02.mp3.mpeg";
import Vo_pudge_pud_spawn_01_mp3_mpeg from "../assets/notifications/Vo_pudge_pud_spawn_01.mp3.mpeg";
import Vo_pudge_pud_spawn_06_mp3_mpeg from "../assets/notifications/Vo_pudge_pud_spawn_06.mp3.mpeg";
import Vo_shadowshaman_shad_ability_voodoo_04_mp3_mpeg from "../assets/notifications/Vo_shadowshaman_shad_ability_voodoo_04.mp3.mpeg";
import Vo_shadowshaman_shad_level_03_mp3_mpeg from "../assets/notifications/Vo_shadowshaman_shad_level_03.mp3.mpeg";
import Vo_witchdoctor_wdoc_attack_06_mp3_mpeg from "../assets/notifications/Vo_witchdoctor_wdoc_attack_06.mp3.mpeg";
import Vo_witchdoctor_wdoc_move_06_mp3_mpeg from "../assets/notifications/Vo_witchdoctor_wdoc_move_06.mp3.mpeg";
import Vo_witchdoctor_wdoc_move_09_mp3_mpeg from "../assets/notifications/Vo_witchdoctor_wdoc_move_09.mp3.mpeg";
import Vo_phantom_assassin_phass_arc_spawn_02_mp3_mpeg from "../assets/notifications/Vo_phantom_assassin_phass_arc_spawn_02.mp3.mpeg";
import Vo_phantom_assassin_phass_move_10_mp3_mpeg from "../assets/notifications/Vo_phantom_assassin_phass_move_10.mp3.mpeg";
import Vo_phantom_assassin_phass_spawn_05_mp3_mpeg from "../assets/notifications/Vo_phantom_assassin_phass_spawn_05.mp3.mpeg";
import Vo_pudge_pud_ability_devour_03_mp3_mpeg from "../assets/notifications/Vo_pudge_pud_ability_devour_03.mp3.mpeg";
import Vo_pudge_pud_ability_hook_miss_01_mp3_mpeg from "../assets/notifications/Vo_pudge_pud_ability_hook_miss_01.mp3.mpeg";
import Vo_shadowshaman_shad_ability_voodoo_06_mp3_mpeg from "../assets/notifications/Vo_shadowshaman_shad_ability_voodoo_06.mp3.mpeg";
import Vo_shadowshaman_shad_ability_ward_04_mp3_mpeg from "../assets/notifications/Vo_shadowshaman_shad_ability_ward_04.mp3.mpeg";
import Vo_shadowshaman_shad_ability_ward_06_mp3_mpeg from "../assets/notifications/Vo_shadowshaman_shad_ability_ward_06.mp3.mpeg";

export const ChatEventEnum = Object.freeze({
  // ? once user is ready to go
  CONNECTED_EVENT: "connected",
  // ? when user gets disconnected
  DISCONNECT_EVENT: "disconnect",
  // ? when user joins a socket room
  JOIN_CHAT_EVENT: "joinChat",
  // ? when participant gets removed from group, chat gets deleted or leaves a group
  LEAVE_CHAT_EVENT: "leaveChat",
  // ? when new message is received
  MESSAGE_RECEIVED_EVENT: "messageReceived",
  // ? when there is new one on one chat, new group chat or user gets added in the group
  NEW_CHAT_EVENT: "newChat",
  // ? when there is an error in socket
  SOCKET_ERROR_EVENT: "socketError",
  // ? when participant stops typing
  STOP_TYPING_EVENT: "stopTyping",
  // ? when participant starts typing
  TYPING_EVENT: "typing",
  // ? when a new user signup
  NEW_USER_CREATE_EVENT: "newUserCreate",
  // ? when a new user comes online or goes offline
  USER_ONLINE_STATUS: "userOnlineStatus",
  // ? for updating sidebar information (e.g: lastMessage, lastMessageTimeStamp)
  CONVERSATION_UPDATE_EVENT: "conversationUpdate",
  // ? when a user click on an inbox
  MESSAGE_SEEN_EVENT: "messageSeen",
  // ? when a user sees a message
  LAST_SEEN_MESSAGE: "lastSeenMessage",
  // ? when messages are deleted
  MESSAGE_DELETE: "messageDelete",
});

export const GroupChatEventEnum = Object.freeze({
  // ? when new message is received
  GROUP_MESSAGE_RECEIVED_EVENT: "groupMessageReceived",
  // ? when a user click on an group
  GROUP_MESSAGE_SEEN_EVENT: "groupMessageSeen",
  // ? groups update event, if a group is deleted to crated
  GROUP_UPDATE_EVENT: "groupUpdateEvent",
  // ? when participant starts typing
  GROUP_TYPING_EVENT: "groupTyping",
  // ? when participant stops typing
  STOP_GROUP_TYPING_EVENT: "stopGroupTyping",
  // ? when a user sees a message
  GROUP_LAST_SEEN: "groupLastSeen",
  // ? when group messages are deleted
  GROUP_MESSAGE_DELETE: "groupMessageDelete",
});

export const notificationSounds = [
  Vo_phantom_assassin_phass_spawn_01_mp3_mpeg,
  Vo_phantom_assassin_phass_spawn_03_mp3_mpeg,
  Vo_pudge_pud_ability_devour_02_mp3_mpeg,
  Vo_pudge_pud_ability_hook_02_mp3_mpeg,
  Vo_pudge_pud_spawn_01_mp3_mpeg,
  Vo_pudge_pud_spawn_06_mp3_mpeg,
  Vo_shadowshaman_shad_ability_voodoo_04_mp3_mpeg,
  Vo_shadowshaman_shad_level_03_mp3_mpeg,
  Vo_witchdoctor_wdoc_attack_06_mp3_mpeg,
  Vo_witchdoctor_wdoc_move_06_mp3_mpeg,
  Vo_witchdoctor_wdoc_move_09_mp3_mpeg,
  Vo_phantom_assassin_phass_arc_spawn_02_mp3_mpeg,
  Vo_phantom_assassin_phass_move_10_mp3_mpeg,
  Vo_phantom_assassin_phass_spawn_05_mp3_mpeg,
  Vo_pudge_pud_ability_devour_03_mp3_mpeg,
  Vo_pudge_pud_ability_hook_miss_01_mp3_mpeg,
  Vo_shadowshaman_shad_ability_voodoo_06_mp3_mpeg,
  Vo_shadowshaman_shad_ability_ward_04_mp3_mpeg,
  Vo_shadowshaman_shad_ability_ward_06_mp3_mpeg,
];
