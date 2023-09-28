import Link from "next/link";
import Moment from "react-moment";
import { BsThreeDotsVertical } from "react-icons/bs";

export default function TaskBar({ session, e, k, setConfirmWindow }) {
    const isCompleted = e.completed.includes(Number(session?.user?.id));
    const isExpire = (new Date(e.expireDate.seconds * 1000)) < (new Date());

    return (
      <tr className={`border-b dark:border-gray-700 border space-y-2 ${
          isCompleted ? "bg-emerald-500/30 border-emerald-500" : isExpire ? "bg-red-500/30 border-red-500" : "bg-blue-500/30 border-blue-500"
        }`}
      >
        <th scope="row" className="px-6 py-4 font-medium whitespace-nowrap">
          {k + 1}
        </th>
        <td className="px-6 py-4">{e.title}</td>
        <td className="px-6 py-4">
          {isExpire ? (
            "Expired"
          ) : <Moment duration={new Date()} format="DD [days], hh:mm:ss" interval={1000} date={e.expireDate.seconds * 1000} />}
        </td>
        <td className="px-6 py-4">
          {isCompleted ? (
            <p>Done</p>
          ) : !isExpire ? (
            <button
              type="button"
              onClick={() => setConfirmWindow({ e, k })}
              className="px-3 rounded font-medium py-1.5 bg-green-700/70 outline-none ring-0 text-white dark:text-gray-200 transition-all hover:bg-green-800/80"
            >
              Mark as done
            </button>
          ) : <p>Incomplete</p>}

        </td>
        <td className="px-6 py-4">
          {session?.user?.permissions?.includes("tasks-management") && (
            <Link href={`/admin/tasks/${e.id}`}>
              <BsThreeDotsVertical className="h-6 w-6" />
            </Link>
          )}
        </td>
      </tr>
    );
}