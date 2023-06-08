import { base } from '$app/paths';
import { env } from '$env/dynamic/public';
import { redirect } from '@sveltejs/kit';
import { hasNoAuthorization } from '../../utilities/permissions';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  const { user, permissibleQueries } = await parent();

  if (env.PUBLIC_LOGIN_PAGE === 'disabled' || (user && !hasNoAuthorization(permissibleQueries))) {
    throw redirect(302, `${base}/plans`);
  }

  return {};
};
