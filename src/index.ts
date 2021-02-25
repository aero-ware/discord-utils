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
    chunk<T>(array: T[], size: number): T[][] {
        return array
            .map((_, i) => (i % size ? undefined! : array.slice(i, Math.floor(i / size) * size + size)))
            .filter(($) => !!$);
    },
};
