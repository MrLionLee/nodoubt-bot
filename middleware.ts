import NextAuth from 'next-auth';

import { authConfig } from '@/app/(auth)/auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // 配置当前中间件的匹配规则，这里是匹配所有路由，只有在这些路由上才会执行中间件
  // 可以根据需要进行调整，比如只匹配特定的路由，或者使用正则表达式进行更复杂的匹配
  // 注意：这里的匹配规则是基于路由的，而不是基于方法的，所以如果需要根据方法进行匹配，可以在中间件中自行处理
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/', '/:id', '/api/:path*', '/login', '/register'],
};
