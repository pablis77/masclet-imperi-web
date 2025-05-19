(masclet-imperi) PS C:\Proyectos\claude\masclet-imperi-web> uvicorn app.main:app --reload
INFO:     Will watch for changes in these directories: ['C:\\Proyectos\\claude\\masclet-imperi-web']
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [26252] using WatchFiles
Process SpawnProcess-1:
Traceback (most recent call last):
  File "C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\multiprocessing\process.py", line 314, in _bootstrap
    self.run()
  File "C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\multiprocessing\process.py", line 108, in run
    self._target(*self._args, **self._kwargs)
  File "C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\uvicorn\_subprocess.py", line 76, in subprocess_started
    target(sockets=sockets)
  File "C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\uvicorn\server.py", line 61, in run
    return asyncio.run(self.serve(sockets=sockets))
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\runners.py", line 190, in run
    return runner.run(main)
           ^^^^^^^^^^^^^^^^
  File "C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\runners.py", line 118, in run
    return self._loop.run_until_complete(task)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\asyncio\base_events.py", line 654, in run_until_complete
    return future.result()
           ^^^^^^^^^^^^^^^
  File "C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\uvicorn\server.py", line 68, in serve
    config.load()
  File "C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\uvicorn\config.py", line 467, in load
    self.loaded_app = import_from_string(self.app)
                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\site-packages\uvicorn\importer.py", line 21, in import_from_string
    module = importlib.import_module(module_str)
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\Usuario\anaconda3\envs\masclet-imperi\Lib\importlib\__init__.py", line 126, in import_module
    return _bootstrap._gcd_import(name[level:], package, level)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "<frozen importlib._bootstrap>", line 1204, in _gcd_import
  File "<frozen importlib._bootstrap>", line 1176, in _find_and_load
  File "<frozen importlib._bootstrap>", line 1147, in _find_and_load_unlocked
  File "<frozen importlib._bootstrap>", line 690, in _load_unlocked
  File "<frozen importlib._bootstrap_external>", line 940, in exec_module
  File "<frozen importlib._bootstrap>", line 241, in _call_with_frames_removed
  File "C:\Proyectos\claude\masclet-imperi-web\backend\app\main.py", line 10, in <module>        
    from app.api.router import api_router
  File "C:\Proyectos\claude\masclet-imperi-web\backend\app\api\__init__.py", line 5, in <module> 
    from .router import api_router
  File "C:\Proyectos\claude\masclet-imperi-web\backend\app\api\router.py", line 5, in <module>   
    from app.api.endpoints import explotacions, animals, partos
  File "C:\Proyectos\claude\masclet-imperi-web\backend\app\api\endpoints\__init__.py", line 4, in <module>
    from . import animals
  File "C:\Proyectos\claude\masclet-imperi-web\backend\app\api\endpoints\animals.py", line 11, in <module>
    from app.models.animal import Animal, Genere, Estado, Part, EstadoAlletar
  File "C:\Proyectos\claude\masclet-imperi-web\backend\app\models\__init__.py", line 10, in <module>
    from .parto import Part
ImportError: cannot import name 'Part' from 'app.models.parto' (C:\Proyectos\claude\masclet-imperi-web\backend\app\models\parto.py)