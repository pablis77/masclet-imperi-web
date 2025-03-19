# Output de Tests DateUtils

Por favor, ejecuta:
```bash
cd backend && python -m pytest tests/test_date_utils.py -v
```

Y copia el resultado completo aquí, incluyendo:
- Total de tests ejecutados
- Tests que pasaron/fallaron
- Cualquier error o excepción
- Tiempo de ejecución

Esto nos ayudará a:
1. Verificar que los tests de DateConverter funcionan
2. Identificar cualquier error en la implementación
3. Documentar los resultados para futuras referencias

RESULTADO:

(masclet-imperi) PS C:\Proyectos\claude\masclet-imperi-web\backend> python -m pytest tests/test_date_utils.py -v              
c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:207: PytestDeprecationWarning: The configuration option "asyncio_default_fixture_loop_scope" is unset.
The event loop scope for asynchronous fixtures will default to the fixture caching scope. Future versions of pytest-asyncio will default the loop scope for asynchronous fixtures to function scope. Set the default fixture loop scope explicitly in order to avoid unexpected behavior in the future. Valid fixture loop scopes are: "function", "class", "module", "package", "session"

  warnings.warn(PytestDeprecationWarning(_DEFAULT_FIXTURE_LOOP_SCOPE_UNSET))
======================================================================================== test session starts =========================================================================================
platform win32 -- Python 3.11.11, pytest-8.3.4, pluggy-1.5.0 -- C:\Users\Usuario\anaconda3\envs\masclet-imperi\python.exe
cachedir: .pytest_cache
rootdir: C:\Proyectos\claude\masclet-imperi-web\backend
configfile: pytest.ini
plugins: anyio-3.7.1, asyncio-0.25.3, cov-6.0.0, env-1.1.5, ordering-0.6
asyncio: mode=Mode.AUTO, asyncio_default_fixture_loop_scope=None
collected 15 items

tests/test_date_utils.py::test_to_db_format_valid_es_date ERROR                                                                                                                                 [  6%]
tests/test_date_utils.py::test_to_db_format_valid_db_date ERROR                                                                                                                                 [ 13%]
tests/test_date_utils.py::test_to_db_format_datetime_objects ERROR                                                                                                                              [ 20%]
tests/test_date_utils.py::test_to_db_format_invalid_date ERROR                                                                                                                                  [ 26%]
tests/test_date_utils.py::test_to_es_format_valid_db_date ERROR                                                                                                                                 [ 33%]
tests/test_date_utils.py::test_to_es_format_valid_es_date ERROR                                                                                                                                 [ 40%]
tests/test_date_utils.py::test_to_es_format_datetime_objects ERROR                                                                                                                              [ 46%]
tests/test_date_utils.py::test_to_es_format_invalid_date ERROR                                                                                                                                  [ 53%]
tests/test_date_utils.py::test_is_valid_date_es_format ERROR                                                                                                                                    [ 60%]
tests/test_date_utils.py::test_is_valid_date_db_format ERROR                                                                                                                                    [ 66%]
tests/test_date_utils.py::test_is_valid_date_objects ERROR                                                                                                                                      [ 73%]
tests/test_date_utils.py::test_get_display_format_valid_dates ERROR                                                                                                                             [ 80%]
tests/test_date_utils.py::test_get_display_format_objects ERROR                                                                                                                                 [ 86%]
tests/test_date_utils.py::test_get_display_format_invalid_dates ERROR                                                                                                                           [ 93%]
tests/test_date_utils.py::test_edge_cases ERROR                                                                                                                                                 [100%]
----------------------------------------------------------------------------------------- live log teardown ------------------------------------------------------------------------------------------ 
2025-03-03 18:51:45 [   ERROR] Future exception was never retrieved
future: <Future finished exception=ConnectionDoesNotExistError('connection was closed in the middle of operation')> (base_events.py:1785)
asyncpg.exceptions.ConnectionDoesNotExistError: connection was closed in the middle of operation

2025-03-03 18:51:45 [    INFO] Tortoise-ORM shutdown (__init__.py:570)


=============================================================================================== ERRORS =============================================================================================== 
_________________________________________________________________________ ERROR at setup of test_to_db_format_valid_es_date __________________________________________________________________________ 
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\asyncpg\client.py:138: in execute_query
    res = await connection.execute(*params)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connection.py:349: in execute
    result = await self._protocol.query(query, timeout)
asyncpg\\protocol\\protocol.pyx:375: in query
    ???
E   RuntimeError: Task <Task pending name='Task-3' coro=<_wrap_asyncgen_fixture.<locals>._asyncgen_fixture_wrapper.<locals>.setup() running at c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:324> cb=[_run_until_complete_cb() at C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:181]> got Future <Future pending cb=[BaseProtocol._on_waiter_completed()]> attached to a different loop

During handling of the above exception, another exception occurred:
c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:329: in _asyncgen_fixture_wrapper
    result = event_loop.run_until_complete(setup_task)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:654: in run_until_complete
    return future.result()
c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:324: in setup
    res = await gen_obj.__anext__()  # type: ignore[union-attr]
tests\conftest.py:34: in clean_db
    await Tortoise.get_connection("default").execute_query("DELETE FROM animals")
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\base_postgres\client.py:31: in _translate_exceptions
    return await self._translate_exceptions(func, *args, **kwargs)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\asyncpg\client.py:87: in _translate_exceptions
    return await func(self, *args, **kwargs)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\asyncpg\client.py:131: in execute_query
    async with self.acquire_connection() as connection:
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:228: in release
    raise ex
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:218: in release
    await self._con.reset(timeout=budget)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connection.py:1562: in reset
    await self.execute(reset_query)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connection.py:349: in execute
    result = await self._protocol.query(query, timeout)
asyncpg\\protocol\\protocol.pyx:360: in query
    ???
asyncpg\\protocol\\protocol.pyx:745: in asyncpg.protocol.protocol.BaseProtocol._check_state
    ???
E   asyncpg.exceptions._base.InterfaceError: cannot perform operation: another operation is in progress
_________________________________________________________________________ ERROR at setup of test_to_db_format_valid_db_date __________________________________________________________________________ 
c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:329: in _asyncgen_fixture_wrapper
    result = event_loop.run_until_complete(setup_task)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:654: in run_until_complete
    return future.result()
c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:324: in setup
    res = await gen_obj.__anext__()  # type: ignore[union-attr]
tests\conftest.py:34: in clean_db
    await Tortoise.get_connection("default").execute_query("DELETE FROM animals")
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\base_postgres\client.py:31: in _translate_exceptions
    return await self._translate_exceptions(func, *args, **kwargs)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\asyncpg\client.py:87: in _translate_exceptions
    return await func(self, *args, **kwargs)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\asyncpg\client.py:131: in execute_query
    async with self.acquire_connection() as connection:
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\base\client.py:362: in __aenter__
    self.connection = await self.client._pool.acquire()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:864: in _acquire
    return await _acquire_impl()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:849: in _acquire_impl
    proxy = await ch.acquire()  # type: PoolConnectionProxy
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:140: in acquire
    await self.connect()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:132: in connect
    self._con = await self._pool._get_new_connection()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:517: in _get_new_connection
    con = await self._connect(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connection.py:2421: in connect
    return await connect_utils._connect(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:1049: in _connect
    conn = await _connect_addr(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:886: in _connect_addr
    return await __connect_addr(params, True, *args)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:931: in __connect_addr
    tr, pr = await connector
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:802: in _create_ssl_connection
    tr, pr = await loop.create_connection(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:1046: in create_connection
    infos = await self._ensure_resolved(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:1420: in _ensure_resolved
    return await loop.getaddrinfo(host, port, family=family, type=type,
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:868: in getaddrinfo
    return await self.run_in_executor(
E   RuntimeError: Task <Task pending name='Task-5' coro=<_wrap_asyncgen_fixture.<locals>._asyncgen_fixture_wrapper.<locals>.setup() running at c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:324> cb=[_run_until_complete_cb() at C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:181]> got Future <Future pending cb=[_chain_future.<locals>._call_check_cancel() at C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\futures.py:387]> attached to a different loop
________________________________________________________________________ ERROR at setup of test_to_db_format_datetime_objects ________________________________________________________________________ 
c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:329: in _asyncgen_fixture_wrapper
    result = event_loop.run_until_complete(setup_task)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:654: in run_until_complete
    return future.result()
c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:324: in setup
    res = await gen_obj.__anext__()  # type: ignore[union-attr]
tests\conftest.py:34: in clean_db
    await Tortoise.get_connection("default").execute_query("DELETE FROM animals")
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\base_postgres\client.py:31: in _translate_exceptions
    return await self._translate_exceptions(func, *args, **kwargs)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\asyncpg\client.py:87: in _translate_exceptions
    return await func(self, *args, **kwargs)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\asyncpg\client.py:131: in execute_query
    async with self.acquire_connection() as connection:
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\base\client.py:362: in __aenter__
    self.connection = await self.client._pool.acquire()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:864: in _acquire
    return await _acquire_impl()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:849: in _acquire_impl
    proxy = await ch.acquire()  # type: PoolConnectionProxy
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:140: in acquire
    await self.connect()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:132: in connect
    self._con = await self._pool._get_new_connection()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:517: in _get_new_connection
    con = await self._connect(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connection.py:2421: in connect
    return await connect_utils._connect(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:1049: in _connect
    conn = await _connect_addr(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:886: in _connect_addr
    return await __connect_addr(params, True, *args)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:931: in __connect_addr
    tr, pr = await connector
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:802: in _create_ssl_connection
    tr, pr = await loop.create_connection(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:1046: in create_connection
    infos = await self._ensure_resolved(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:1420: in _ensure_resolved
    return await loop.getaddrinfo(host, port, family=family, type=type,
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:868: in getaddrinfo
    return await self.run_in_executor(
E   RuntimeError: Task <Task pending name='Task-6' coro=<_wrap_asyncgen_fixture.<locals>._asyncgen_fixture_wrapper.<locals>.setup() running at c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:324> cb=[_run_until_complete_cb() at C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:181]> got Future <Future pending cb=[_chain_future.<locals>._call_check_cancel() at C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\futures.py:387]> attached to a different loop
__________________________________________________________________________ ERROR at setup of test_to_db_format_invalid_date __________________________________________________________________________ 
c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:329: in _asyncgen_fixture_wrapper
    result = event_loop.run_until_complete(setup_task)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:654: in run_until_complete
    return future.result()
c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:324: in setup
    res = await gen_obj.__anext__()  # type: ignore[union-attr]
tests\conftest.py:34: in clean_db
    await Tortoise.get_connection("default").execute_query("DELETE FROM animals")
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\base_postgres\client.py:31: in _translate_exceptions
    return await self._translate_exceptions(func, *args, **kwargs)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\asyncpg\client.py:87: in _translate_exceptions
    return await func(self, *args, **kwargs)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\asyncpg\client.py:131: in execute_query
    async with self.acquire_connection() as connection:
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\base\client.py:362: in __aenter__
    self.connection = await self.client._pool.acquire()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:864: in _acquire
    return await _acquire_impl()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:849: in _acquire_impl
    proxy = await ch.acquire()  # type: PoolConnectionProxy
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:140: in acquire
    await self.connect()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:132: in connect
    self._con = await self._pool._get_new_connection()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:517: in _get_new_connection
    con = await self._connect(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connection.py:2421: in connect
    return await connect_utils._connect(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:1049: in _connect
    conn = await _connect_addr(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:886: in _connect_addr
    return await __connect_addr(params, True, *args)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:931: in __connect_addr
    tr, pr = await connector
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:802: in _create_ssl_connection
    tr, pr = await loop.create_connection(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:1046: in create_connection
    infos = await self._ensure_resolved(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:1420: in _ensure_resolved
    return await loop.getaddrinfo(host, port, family=family, type=type,
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:868: in getaddrinfo
    return await self.run_in_executor(
E   RuntimeError: Task <Task pending name='Task-7' coro=<_wrap_asyncgen_fixture.<locals>._asyncgen_fixture_wrapper.<locals>.setup() running at c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:324> cb=[_run_until_complete_cb() at C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:181]> got Future <Future pending cb=[_chain_future.<locals>._call_check_cancel() at C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\futures.py:387]> attached to a different loop
_________________________________________________________________________ ERROR at setup of test_to_es_format_valid_db_date __________________________________________________________________________ 
c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:329: in _asyncgen_fixture_wrapper
    result = event_loop.run_until_complete(setup_task)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:654: in run_until_complete
    return future.result()
c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:324: in setup
    res = await gen_obj.__anext__()  # type: ignore[union-attr]
tests\conftest.py:34: in clean_db
    await Tortoise.get_connection("default").execute_query("DELETE FROM animals")
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\base_postgres\client.py:31: in _translate_exceptions
    return await self._translate_exceptions(func, *args, **kwargs)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\asyncpg\client.py:87: in _translate_exceptions
    return await func(self, *args, **kwargs)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\asyncpg\client.py:131: in execute_query
    async with self.acquire_connection() as connection:
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\base\client.py:362: in __aenter__
    self.connection = await self.client._pool.acquire()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:864: in _acquire
    return await _acquire_impl()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:849: in _acquire_impl
    proxy = await ch.acquire()  # type: PoolConnectionProxy
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:140: in acquire
    await self.connect()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:132: in connect
    self._con = await self._pool._get_new_connection()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:517: in _get_new_connection
    con = await self._connect(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connection.py:2421: in connect
    return await connect_utils._connect(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:1049: in _connect
    conn = await _connect_addr(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:886: in _connect_addr
    return await __connect_addr(params, True, *args)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:931: in __connect_addr
    tr, pr = await connector
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:802: in _create_ssl_connection
    tr, pr = await loop.create_connection(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:1046: in create_connection
    infos = await self._ensure_resolved(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:1420: in _ensure_resolved
    return await loop.getaddrinfo(host, port, family=family, type=type,
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:868: in getaddrinfo
    return await self.run_in_executor(
E   RuntimeError: Task <Task pending name='Task-8' coro=<_wrap_asyncgen_fixture.<locals>._asyncgen_fixture_wrapper.<locals>.setup() running at c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:324> cb=[_run_until_complete_cb() at C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:181]> got Future <Future pending cb=[_chain_future.<locals>._call_check_cancel() at C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\futures.py:387]> attached to a different loop
_________________________________________________________________________ ERROR at setup of test_to_es_format_valid_es_date __________________________________________________________________________ 
c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:329: in _asyncgen_fixture_wrapper
    result = event_loop.run_until_complete(setup_task)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:654: in run_until_complete
    return future.result()
c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:324: in setup
    res = await gen_obj.__anext__()  # type: ignore[union-attr]
tests\conftest.py:34: in clean_db
    await Tortoise.get_connection("default").execute_query("DELETE FROM animals")
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\base_postgres\client.py:31: in _translate_exceptions
    return await self._translate_exceptions(func, *args, **kwargs)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\asyncpg\client.py:87: in _translate_exceptions
    return await func(self, *args, **kwargs)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\asyncpg\client.py:131: in execute_query
    async with self.acquire_connection() as connection:
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\base\client.py:362: in __aenter__
    self.connection = await self.client._pool.acquire()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:864: in _acquire
    return await _acquire_impl()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:849: in _acquire_impl
    proxy = await ch.acquire()  # type: PoolConnectionProxy
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:140: in acquire
    await self.connect()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:132: in connect
    self._con = await self._pool._get_new_connection()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:517: in _get_new_connection
    con = await self._connect(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connection.py:2421: in connect
    return await connect_utils._connect(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:1049: in _connect
    conn = await _connect_addr(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:886: in _connect_addr
    return await __connect_addr(params, True, *args)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:931: in __connect_addr
    tr, pr = await connector
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:802: in _create_ssl_connection
    tr, pr = await loop.create_connection(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:1046: in create_connection
    infos = await self._ensure_resolved(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:1420: in _ensure_resolved
    return await loop.getaddrinfo(host, port, family=family, type=type,
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:868: in getaddrinfo
    return await self.run_in_executor(
E   RuntimeError: Task <Task pending name='Task-9' coro=<_wrap_asyncgen_fixture.<locals>._asyncgen_fixture_wrapper.<locals>.setup() running at c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:324> cb=[_run_until_complete_cb() at C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:181]> got Future <Future pending cb=[_chain_future.<locals>._call_check_cancel() at C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\futures.py:387]> attached to a different loop
________________________________________________________________________ ERROR at setup of test_to_es_format_datetime_objects ________________________________________________________________________ 
c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:329: in _asyncgen_fixture_wrapper
    result = event_loop.run_until_complete(setup_task)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:654: in run_until_complete
    return future.result()
c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:324: in setup
    res = await gen_obj.__anext__()  # type: ignore[union-attr]
tests\conftest.py:34: in clean_db
    await Tortoise.get_connection("default").execute_query("DELETE FROM animals")
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\base_postgres\client.py:31: in _translate_exceptions
    return await self._translate_exceptions(func, *args, **kwargs)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\asyncpg\client.py:87: in _translate_exceptions
    return await func(self, *args, **kwargs)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\asyncpg\client.py:131: in execute_query
    async with self.acquire_connection() as connection:
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\base\client.py:362: in __aenter__
    self.connection = await self.client._pool.acquire()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:864: in _acquire
    return await _acquire_impl()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:849: in _acquire_impl
    proxy = await ch.acquire()  # type: PoolConnectionProxy
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:140: in acquire
    await self.connect()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:132: in connect
    self._con = await self._pool._get_new_connection()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:517: in _get_new_connection
    con = await self._connect(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connection.py:2421: in connect
    return await connect_utils._connect(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:1049: in _connect
    conn = await _connect_addr(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:886: in _connect_addr
    return await __connect_addr(params, True, *args)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:931: in __connect_addr
    tr, pr = await connector
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:802: in _create_ssl_connection
    tr, pr = await loop.create_connection(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:1046: in create_connection
    infos = await self._ensure_resolved(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:1420: in _ensure_resolved
    return await loop.getaddrinfo(host, port, family=family, type=type,
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:868: in getaddrinfo
    return await self.run_in_executor(
E   RuntimeError: Task <Task pending name='Task-10' coro=<_wrap_asyncgen_fixture.<locals>._asyncgen_fixture_wrapper.<locals>.setup() running at c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:324> cb=[_run_until_complete_cb() at C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:181]> got Future <Future pending cb=[_chain_future.<locals>._call_check_cancel() at C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\futures.py:387]> attached to a different loop
__________________________________________________________________________ ERROR at setup of test_to_es_format_invalid_date __________________________________________________________________________ 
c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:329: in _asyncgen_fixture_wrapper
    result = event_loop.run_until_complete(setup_task)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:654: in run_until_complete
    return future.result()
c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:324: in setup
    res = await gen_obj.__anext__()  # type: ignore[union-attr]
tests\conftest.py:34: in clean_db
    await Tortoise.get_connection("default").execute_query("DELETE FROM animals")
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\base_postgres\client.py:31: in _translate_exceptions
    return await self._translate_exceptions(func, *args, **kwargs)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\asyncpg\client.py:87: in _translate_exceptions
    return await func(self, *args, **kwargs)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\asyncpg\client.py:131: in execute_query
    async with self.acquire_connection() as connection:
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\base\client.py:362: in __aenter__
    self.connection = await self.client._pool.acquire()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:864: in _acquire
    return await _acquire_impl()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:849: in _acquire_impl
    proxy = await ch.acquire()  # type: PoolConnectionProxy
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:140: in acquire
    await self.connect()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:132: in connect
    self._con = await self._pool._get_new_connection()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:517: in _get_new_connection
    con = await self._connect(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connection.py:2421: in connect
    return await connect_utils._connect(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:1049: in _connect
    conn = await _connect_addr(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:886: in _connect_addr
    return await __connect_addr(params, True, *args)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:931: in __connect_addr
    tr, pr = await connector
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:802: in _create_ssl_connection
    tr, pr = await loop.create_connection(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:1046: in create_connection
    infos = await self._ensure_resolved(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:1420: in _ensure_resolved
    return await loop.getaddrinfo(host, port, family=family, type=type,
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:868: in getaddrinfo
    return await self.run_in_executor(
E   RuntimeError: Task <Task pending name='Task-11' coro=<_wrap_asyncgen_fixture.<locals>._asyncgen_fixture_wrapper.<locals>.setup() running at c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:324> cb=[_run_until_complete_cb() at C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:181]> got Future <Future pending cb=[_chain_future.<locals>._call_check_cancel() at C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\futures.py:387]> attached to a different loop
___________________________________________________________________________ ERROR at setup of test_is_valid_date_es_format ___________________________________________________________________________ 
c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:329: in _asyncgen_fixture_wrapper
    result = event_loop.run_until_complete(setup_task)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:654: in run_until_complete
    return future.result()
c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:324: in setup
    res = await gen_obj.__anext__()  # type: ignore[union-attr]
tests\conftest.py:34: in clean_db
    await Tortoise.get_connection("default").execute_query("DELETE FROM animals")
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\base_postgres\client.py:31: in _translate_exceptions
    return await self._translate_exceptions(func, *args, **kwargs)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\asyncpg\client.py:87: in _translate_exceptions
    return await func(self, *args, **kwargs)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\asyncpg\client.py:131: in execute_query
    async with self.acquire_connection() as connection:
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\base\client.py:362: in __aenter__
    self.connection = await self.client._pool.acquire()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:864: in _acquire
    return await _acquire_impl()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:849: in _acquire_impl
    proxy = await ch.acquire()  # type: PoolConnectionProxy
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:140: in acquire
    await self.connect()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:132: in connect
    self._con = await self._pool._get_new_connection()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:517: in _get_new_connection
    con = await self._connect(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connection.py:2421: in connect
    return await connect_utils._connect(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:1049: in _connect
    conn = await _connect_addr(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:886: in _connect_addr
    return await __connect_addr(params, True, *args)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:931: in __connect_addr
    tr, pr = await connector
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:802: in _create_ssl_connection
    tr, pr = await loop.create_connection(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:1046: in create_connection
    infos = await self._ensure_resolved(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:1420: in _ensure_resolved
    return await loop.getaddrinfo(host, port, family=family, type=type,
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:868: in getaddrinfo
    return await self.run_in_executor(
E   RuntimeError: Task <Task pending name='Task-12' coro=<_wrap_asyncgen_fixture.<locals>._asyncgen_fixture_wrapper.<locals>.setup() running at c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:324> cb=[_run_until_complete_cb() at C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:181]> got Future <Future pending cb=[_chain_future.<locals>._call_check_cancel() at C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\futures.py:387]> attached to a different loop
___________________________________________________________________________ ERROR at setup of test_is_valid_date_db_format ___________________________________________________________________________ 
c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:329: in _asyncgen_fixture_wrapper
    result = event_loop.run_until_complete(setup_task)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:654: in run_until_complete
    return future.result()
c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:324: in setup
    res = await gen_obj.__anext__()  # type: ignore[union-attr]
tests\conftest.py:34: in clean_db
    await Tortoise.get_connection("default").execute_query("DELETE FROM animals")
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\base_postgres\client.py:31: in _translate_exceptions
    return await self._translate_exceptions(func, *args, **kwargs)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\asyncpg\client.py:87: in _translate_exceptions
    return await func(self, *args, **kwargs)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\asyncpg\client.py:131: in execute_query
    async with self.acquire_connection() as connection:
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\base\client.py:362: in __aenter__
    self.connection = await self.client._pool.acquire()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:864: in _acquire
    return await _acquire_impl()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:849: in _acquire_impl
    proxy = await ch.acquire()  # type: PoolConnectionProxy
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:140: in acquire
    await self.connect()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:132: in connect
    self._con = await self._pool._get_new_connection()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:517: in _get_new_connection
    con = await self._connect(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connection.py:2421: in connect
    return await connect_utils._connect(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:1049: in _connect
    conn = await _connect_addr(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:886: in _connect_addr
    return await __connect_addr(params, True, *args)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:931: in __connect_addr
    tr, pr = await connector
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:802: in _create_ssl_connection
    tr, pr = await loop.create_connection(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:1046: in create_connection
    infos = await self._ensure_resolved(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:1420: in _ensure_resolved
    return await loop.getaddrinfo(host, port, family=family, type=type,
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:868: in getaddrinfo
    return await self.run_in_executor(
E   RuntimeError: Task <Task pending name='Task-13' coro=<_wrap_asyncgen_fixture.<locals>._asyncgen_fixture_wrapper.<locals>.setup() running at c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:324> cb=[_run_until_complete_cb() at C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:181]> got Future <Future pending cb=[_chain_future.<locals>._call_check_cancel() at C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\futures.py:387]> attached to a different loop
____________________________________________________________________________ ERROR at setup of test_is_valid_date_objects ____________________________________________________________________________ 
c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:329: in _asyncgen_fixture_wrapper
    result = event_loop.run_until_complete(setup_task)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:654: in run_until_complete
    return future.result()
c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:324: in setup
    res = await gen_obj.__anext__()  # type: ignore[union-attr]
tests\conftest.py:34: in clean_db
    await Tortoise.get_connection("default").execute_query("DELETE FROM animals")
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\base_postgres\client.py:31: in _translate_exceptions
    return await self._translate_exceptions(func, *args, **kwargs)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\asyncpg\client.py:87: in _translate_exceptions
    return await func(self, *args, **kwargs)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\asyncpg\client.py:131: in execute_query
    async with self.acquire_connection() as connection:
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\base\client.py:362: in __aenter__
    self.connection = await self.client._pool.acquire()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:864: in _acquire
    return await _acquire_impl()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:849: in _acquire_impl
    proxy = await ch.acquire()  # type: PoolConnectionProxy
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:140: in acquire
    await self.connect()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:132: in connect
    self._con = await self._pool._get_new_connection()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:517: in _get_new_connection
    con = await self._connect(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connection.py:2421: in connect
    return await connect_utils._connect(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:1049: in _connect
    conn = await _connect_addr(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:886: in _connect_addr
    return await __connect_addr(params, True, *args)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:931: in __connect_addr
    tr, pr = await connector
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:802: in _create_ssl_connection
    tr, pr = await loop.create_connection(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:1046: in create_connection
    infos = await self._ensure_resolved(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:1420: in _ensure_resolved
    return await loop.getaddrinfo(host, port, family=family, type=type,
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:868: in getaddrinfo
    return await self.run_in_executor(
E   RuntimeError: Task <Task pending name='Task-14' coro=<_wrap_asyncgen_fixture.<locals>._asyncgen_fixture_wrapper.<locals>.setup() running at c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:324> cb=[_run_until_complete_cb() at C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:181]> got Future <Future pending cb=[_chain_future.<locals>._call_check_cancel() at C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\futures.py:387]> attached to a different loop
_______________________________________________________________________ ERROR at setup of test_get_display_format_valid_dates ________________________________________________________________________ 
c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:329: in _asyncgen_fixture_wrapper
    result = event_loop.run_until_complete(setup_task)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:654: in run_until_complete
    return future.result()
c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:324: in setup
    res = await gen_obj.__anext__()  # type: ignore[union-attr]
tests\conftest.py:34: in clean_db
    await Tortoise.get_connection("default").execute_query("DELETE FROM animals")
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\base_postgres\client.py:31: in _translate_exceptions
    return await self._translate_exceptions(func, *args, **kwargs)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\asyncpg\client.py:87: in _translate_exceptions
    return await func(self, *args, **kwargs)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\asyncpg\client.py:131: in execute_query
    async with self.acquire_connection() as connection:
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\base\client.py:362: in __aenter__
    self.connection = await self.client._pool.acquire()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:864: in _acquire
    return await _acquire_impl()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:849: in _acquire_impl
    proxy = await ch.acquire()  # type: PoolConnectionProxy
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:140: in acquire
    await self.connect()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:132: in connect
    self._con = await self._pool._get_new_connection()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:517: in _get_new_connection
    con = await self._connect(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connection.py:2421: in connect
    return await connect_utils._connect(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:1049: in _connect
    conn = await _connect_addr(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:886: in _connect_addr
    return await __connect_addr(params, True, *args)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:931: in __connect_addr
    tr, pr = await connector
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:802: in _create_ssl_connection
    tr, pr = await loop.create_connection(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:1046: in create_connection
    infos = await self._ensure_resolved(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:1420: in _ensure_resolved
    return await loop.getaddrinfo(host, port, family=family, type=type,
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:868: in getaddrinfo
    return await self.run_in_executor(
E   RuntimeError: Task <Task pending name='Task-15' coro=<_wrap_asyncgen_fixture.<locals>._asyncgen_fixture_wrapper.<locals>.setup() running at c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:324> cb=[_run_until_complete_cb() at C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:181]> got Future <Future pending cb=[_chain_future.<locals>._call_check_cancel() at C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\futures.py:387]> attached to a different loop
_________________________________________________________________________ ERROR at setup of test_get_display_format_objects __________________________________________________________________________ 
c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:329: in _asyncgen_fixture_wrapper
    result = event_loop.run_until_complete(setup_task)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:654: in run_until_complete
    return future.result()
c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:324: in setup
    res = await gen_obj.__anext__()  # type: ignore[union-attr]
tests\conftest.py:34: in clean_db
    await Tortoise.get_connection("default").execute_query("DELETE FROM animals")
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\base_postgres\client.py:31: in _translate_exceptions
    return await self._translate_exceptions(func, *args, **kwargs)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\asyncpg\client.py:87: in _translate_exceptions
    return await func(self, *args, **kwargs)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\asyncpg\client.py:131: in execute_query
    async with self.acquire_connection() as connection:
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\base\client.py:362: in __aenter__
    self.connection = await self.client._pool.acquire()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:864: in _acquire
    return await _acquire_impl()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:849: in _acquire_impl
    proxy = await ch.acquire()  # type: PoolConnectionProxy
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:140: in acquire
    await self.connect()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:132: in connect
    self._con = await self._pool._get_new_connection()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:517: in _get_new_connection
    con = await self._connect(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connection.py:2421: in connect
    return await connect_utils._connect(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:1049: in _connect
    conn = await _connect_addr(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:886: in _connect_addr
    return await __connect_addr(params, True, *args)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:931: in __connect_addr
    tr, pr = await connector
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:802: in _create_ssl_connection
    tr, pr = await loop.create_connection(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:1046: in create_connection
    infos = await self._ensure_resolved(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:1420: in _ensure_resolved
    return await loop.getaddrinfo(host, port, family=family, type=type,
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:868: in getaddrinfo
    return await self.run_in_executor(
E   RuntimeError: Task <Task pending name='Task-16' coro=<_wrap_asyncgen_fixture.<locals>._asyncgen_fixture_wrapper.<locals>.setup() running at c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:324> cb=[_run_until_complete_cb() at C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:181]> got Future <Future pending cb=[_chain_future.<locals>._call_check_cancel() at C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\futures.py:387]> attached to a different loop
______________________________________________________________________ ERROR at setup of test_get_display_format_invalid_dates _______________________________________________________________________ 
c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:329: in _asyncgen_fixture_wrapper
    result = event_loop.run_until_complete(setup_task)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:654: in run_until_complete
    return future.result()
c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:324: in setup
    res = await gen_obj.__anext__()  # type: ignore[union-attr]
tests\conftest.py:34: in clean_db
    await Tortoise.get_connection("default").execute_query("DELETE FROM animals")
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\base_postgres\client.py:31: in _translate_exceptions
    return await self._translate_exceptions(func, *args, **kwargs)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\asyncpg\client.py:87: in _translate_exceptions
    return await func(self, *args, **kwargs)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\asyncpg\client.py:131: in execute_query
    async with self.acquire_connection() as connection:
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\base\client.py:362: in __aenter__
    self.connection = await self.client._pool.acquire()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:864: in _acquire
    return await _acquire_impl()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:849: in _acquire_impl
    proxy = await ch.acquire()  # type: PoolConnectionProxy
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:140: in acquire
    await self.connect()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:132: in connect
    self._con = await self._pool._get_new_connection()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:517: in _get_new_connection
    con = await self._connect(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connection.py:2421: in connect
    return await connect_utils._connect(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:1049: in _connect
    conn = await _connect_addr(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:886: in _connect_addr
    return await __connect_addr(params, True, *args)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:931: in __connect_addr
    tr, pr = await connector
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:802: in _create_ssl_connection
    tr, pr = await loop.create_connection(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:1046: in create_connection
    infos = await self._ensure_resolved(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:1420: in _ensure_resolved
    return await loop.getaddrinfo(host, port, family=family, type=type,
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:868: in getaddrinfo
    return await self.run_in_executor(
E   RuntimeError: Task <Task pending name='Task-17' coro=<_wrap_asyncgen_fixture.<locals>._asyncgen_fixture_wrapper.<locals>.setup() running at c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:324> cb=[_run_until_complete_cb() at C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:181]> got Future <Future pending cb=[_chain_future.<locals>._call_check_cancel() at C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\futures.py:387]> attached to a different loop
_________________________________________________________________________________ ERROR at setup of test_edge_cases __________________________________________________________________________________ 
c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:329: in _asyncgen_fixture_wrapper
    result = event_loop.run_until_complete(setup_task)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:654: in run_until_complete
    return future.result()
c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\pytest_asyncio\plugin.py:324: in setup
    res = await gen_obj.__anext__()  # type: ignore[union-attr]
tests\conftest.py:34: in clean_db
    await Tortoise.get_connection("default").execute_query("DELETE FROM animals")
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\base_postgres\client.py:31: in _translate_exceptions
    return await self._translate_exceptions(func, *args, **kwargs)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\asyncpg\client.py:87: in _translate_exceptions
    return await func(self, *args, **kwargs)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\asyncpg\client.py:131: in execute_query
    async with self.acquire_connection() as connection:
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\tortoise\backends\base\client.py:362: in __aenter__
    self.connection = await self.client._pool.acquire()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:864: in _acquire
    return await _acquire_impl()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:849: in _acquire_impl
    proxy = await ch.acquire()  # type: PoolConnectionProxy
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:140: in acquire
    await self.connect()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:132: in connect
    self._con = await self._pool._get_new_connection()
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\pool.py:517: in _get_new_connection
    con = await self._connect(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connection.py:2421: in connect
    return await connect_utils._connect(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:1049: in _connect
    conn = await _connect_addr(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:886: in _connect_addr
    return await __connect_addr(params, True, *args)
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:931: in __connect_addr
    tr, pr = await connector
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\asyncpg\connect_utils.py:802: in _create_ssl_connection
    tr, pr = await loop.create_connection(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:1046: in create_connection
    infos = await self._ensure_resolved(
C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py:1420: in _ensure_resolved
    return await loop.getaddrinfo(host, port, family=family, type=type,
ng at c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site...
ERROR tests/test_date_utils.py::test_to_es_format_valid_es_date - RuntimeError: Task <Task pending name='Task-9' coro=<_wrap_asyncgen_fixture.<locals>._asyncgen_fixture_wrapper.<locals>.setup() running at c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site...     
ERROR tests/test_date_utils.py::test_to_es_format_datetime_objects - RuntimeError: Task <Task pending name='Task-10' coro=<_wrap_asyncgen_fixture.<locals>._asyncgen_fixture_wrapper.<locals>.setup() running at c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\sit...  
ERROR tests/test_date_utils.py::test_to_es_format_invalid_date - RuntimeError: Task <Task pending name='Task-11' coro=<_wrap_asyncgen_fixture.<locals>._asyncgen_fixture_wrapper.<locals>.setup() running at c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\sit...      
ERROR tests/test_date_utils.py::test_is_valid_date_es_format - RuntimeError: Task <Task pending name='Task-12' coro=<_wrap_asyncgen_fixture.<locals>._asyncgen_fixture_wrapper.<locals>.setup() running at c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\sit...        
ng at c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site...
ERROR tests/test_date_utils.py::test_to_es_format_valid_es_date - RuntimeError: Task <Task pending name='Task-9' coro=<_wrap_asyncgen_fixture.<locals>._asyncgen_fixture_wrapper.<locals>.setup() running at c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site...
ERROR tests/test_date_utils.py::test_to_es_format_datetime_objects - RuntimeError: Task <Task pending name='Task-10' coro=<_wrap_asyncgen_fixture.<locals>._asyncgen_fixture_wrapper.<locals>.setup() running at c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\sit...
ERROR tests/test_date_utils.py::test_to_es_format_invalid_date - RuntimeError: Task <Task pending name='Task-11' coro=<_wrap_asyncgen_fixture.<locals>._asyncgen_fixture_wrapper.<locals>.setup() running at c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\sit...
ERROR tests/test_date_utils.py::test_is_valid_date_es_format - RuntimeError: Task <Task pending name='Task-12' coro=<_wrap_asyncgen_fixture.<locals>._asyncgen_fixture_wrapper.<locals>.setup() running at c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\sit...
ERROR tests/test_date_utils.py::test_is_valid_date_db_format - RuntimeError: Task <Task pending name='Task-13' coro=<_wrap_asyncgen_fixture.<locals>._asyncgen_fixture_wrapper.<locals>.setup() running at c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\sit...
ERROR tests/test_date_utils.py::test_is_valid_date_objects - RuntimeError: Task <Task pending name='Task-14' coro=<_wrap_asyncgen_fixture.<locals>._asyncgen_fixture_wrapper.<locals>.setup() running at c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\sit...
ERROR tests/test_date_utils.py::test_get_display_format_valid_dates - RuntimeError: Task <Task pending name='Task-15' coro=<_wrap_asyncgen_fixture.<locals>._asyncgen_fixture_wrapper.<locals>.setup() running at c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\sit...
ERROR tests/test_date_utils.py::test_get_display_format_objects - RuntimeError: Task <Task pending name='Task-16' coro=<_wrap_asyncgen_fixture.<locals>._asyncgen_fixture_wrapper.<locals>.setup() running at c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\sit...
ERROR tests/test_date_utils.py::test_get_display_format_invalid_dates - RuntimeError: Task <Task pending name='Task-17' coro=<_wrap_asyncgen_fixture.<locals>._asyncgen_fixture_wrapper.<locals>.setup() running at c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\sit...
ERROR tests/test_date_utils.py::test_edge_cases - RuntimeError: Task <Task pending name='Task-18' coro=<_wrap_asyncgen_fixture.<locals>._asyncgen_fixture_wrapper.<locals>.setup() running at c:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\sit...
========================================================================================= 15 errors in 4.18s ========================================================================================= 
(masclet-imperi) PS C:\Proyectos\claude\masclet-imperi-web\backend>