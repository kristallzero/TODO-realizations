export function getDesks(user) {
  return await user.populate('desks').desks;
}