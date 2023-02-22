
class UserDto {

    async deserialize(payload1, payload2){
        const result = {
            id: parseInt(payload1.id),
            is_admin: payload1.is_admin,
            is_blocked: payload1.is_blocked,
            is_boss: payload1.is_boss,
            is_secretar: payload1.is_secretar,
            is_system: payload1.is_system,
            login: payload1.login,
            password: payload1.password,
            uirs_users_id: payload1.uirs_users_id,
            tabel_id: payload2.tabel_id,
            id_otdel: payload2.id_otdel,
            famil: payload2.famil,
            name: payload2.name,
            otch: payload2.otch,
            phone: payload2.phone,
            email: payload2.email,
            post: payload2.post,
            small_name_io_famil: payload2.small_name_io_famil,
            full_name: payload2.full_name,
            small_name: payload2.small_name,
            post_full: payload2.post_full,
            description: payload2.description,
            is_del: payload2.is_del,
            uirs_clients_id: parseInt(payload2.uirs_clients_id),
            small_name_rp: payload2.small_name_rp,
            small_name_dp: payload2.small_name_dp,
            birthday: payload2.birthday,
            doctor_id: parseInt(payload2.doctor_id)
        }
        return (result)
    }
}

module.exports = new UserDto();