import { getReaction, getReply } from "./input";
import paginate from "./pagination";
import parse from "./parsing";
import { aDelayOf, getStopwatch } from "./time";

export default {
  paginate,
  aDelayOf,
  getStopwatch,
  getReaction,
  getReply,
  formatMacroCase: parse.case,
  formatList: parse.list,
  parseUsers: parse.users,
  parseMembers: parse.members,
  parseRoles: parse.roles,
  trim: parse.trim,
};
