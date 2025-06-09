import { NavLink } from 'react-router';
import { AudioLines, HeartPulse, Guitar } from 'lucide-react';

const Navbar = () => {
  return (
    <div className="flex w-fit items-center justify-center gap-6 self-center rounded-sm p-4">
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive ? '[&>svg]:stroke-blue-600' : ''
        }
        end
      >
        <AudioLines size={40} />
      </NavLink>
      <NavLink
        to="/metronome"
        className={({ isActive }) =>
          isActive ? '[&>svg]:stroke-blue-600' : ''
        }
        end
      >
        <HeartPulse size={40} />
      </NavLink>
      <NavLink
        to="/songs"
        className={({ isActive }) =>
          isActive ? '[&>svg]:stroke-blue-600' : ''
        }
        end
      >
        <Guitar size={40} />
      </NavLink>
    </div>
  );
};

export { Navbar };
