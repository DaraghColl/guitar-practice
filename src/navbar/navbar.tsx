import { NavLink, useLocation } from 'react-router';
import { AudioLines, HeartPulse, Guitar } from 'lucide-react';
import { motion } from 'motion/react';

const links = [
  {
    to: '/',
    Icon: AudioLines,
  },
  {
    to: '/metronome',
    Icon: HeartPulse,
  },
  {
    to: '/songs',
    Icon: Guitar,
  },
];

const Navbar = () => {
  const location = useLocation();
  const { pathname } = location;
  return (
    <div className="flex w-fit items-center justify-center gap-6 self-center rounded-sm p-4">
      {links.map(({ to, Icon }) => (
        <div key={to} className="relative">
          <NavLink to={to} end>
            <Icon className="stroke-gray-500 dark:stroke-gray-50" size={40} />
          </NavLink>
          {pathname === to && (
            <motion.div
              layoutId="active-nav"
              className="border-secondary absolute -bottom-4 flex w-full justify-center"
            >
              <div className="h-2 w-2 rounded-full bg-gray-500 dark:bg-gray-50" />
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
};

export { Navbar };
