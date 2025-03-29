const ID_PREFIX = "id_";
let id = 0;
export const getUniqueId = ():string => {
  return `${ID_PREFIX}${id++}`;
};
